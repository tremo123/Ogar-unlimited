'use strict';
const WorldModel = require('./WorldModel.js');
const DataBaseConnector = require('./DataBaseConnector.js');
const Entity = require('../entity');

// todo make this a value that comes from the config
const DEFAULT_ID_BLOCK = 1000001;
const ID_BLOCK_SIZE = 100000;

const DEFAULT_ID_BLOCK_PLAYER = 1;
const ID_BLOCK_SIZE_PLAYER = 10000;
const ID_BLOCK_SIZE_PLAYER_MAX = 1000000;


module.exports = class WorldDAO {
  constructor() {
    this.world = new WorldModel();

    // id's are shared thus they must be split - we override the WorldModels handling of id's
    this._idBlock = DEFAULT_ID_BLOCK;
    this._nextIdBlock = DEFAULT_ID_BLOCK + ID_BLOCK_SIZE;
    this._lastNodeId = DEFAULT_ID_BLOCK;


    this._idBlockPlayer = DEFAULT_ID_BLOCK_PLAYER;
    this._nextIdBlockPlayer = DEFAULT_ID_BLOCK_PLAYER + ID_BLOCK_SIZE_PLAYER;
    this._nextPlayerId = DEFAULT_ID_BLOCK_PLAYER;

    // db's
    this.dbMap = {};
    this.dbMap.nodes = new DataBaseConnector('nodes');
    this.dbMap.worldState = new DataBaseConnector('worldState');
    this.dbMap.clients = new DataBaseConnector('clients');

    // who is listening for changes
    this.listeners = {
      world: [],
      nodes: [],
      clients: []
    };

    // listen for changes
    this.dbMap.nodes.onChange((data)=>this.onNodesChange(data));
    this.dbMap.worldState.onChange((data)=>this.onWorldStateChange(data));
    this.dbMap.clients.onChange((data)=>this.onClientsChange(data));

    // setup the id's
    this.setupIdBlocks();
    this.setupNextPlayerId();
  }

  onNodesChange(data) {
    let id = parseInt(data.id);

    if (data.deleted) {
      this.world.removeNode(id);
      return;
    }

    if (data.doc.dbType.includes('-')) {
      this.world.removeNode(id, data.doc.dbType.substr(1))
      return;
    }

    let node = this.world.getNode(id);

    // if node then update it
    if (node) {
      node.updateFromJSON(data.doc)
    }
    // else this is a new node so create it
    else {
      node = Entity.Cell.fromJSON(Entity, data.doc, this);
    }

    // add node to our world
    this.world.setNode(node, undefined, data.doc.dbType);
  }

  onClientsChange(data) {
    // todo

  }

  onWorldStateChange(data) {
    //console.log('onDbChange ' + JSON.stringify(data));
    // ignore these as we dont care
    switch (data.id) {
      case 'idBlock': // ignore
        return;
      case 'gameMode':
        this.world.changeGameMode(data.doc.state);
        return;
      case 'client':
        let id = parseInt(data.doc._id.slice(6), 10);
        // todo do something
        return;
      case 'nextPlayerId':
        //console.log('nextPlayerId ' + JSON.stringify(data) )
        //this._nextPlayerId = parseInt(data.doc.nextPlayerId);
        return;
      default:
        console.error('[WorldDAO.onDbChange] Unknown data type for: ' + data.id + ' data: ' + JSON.stringify(data.doc));
    }
  }

  // todo need to rethink this for world model
  registerListener(what, func) {
    this.listeners[what].push(func);
    return this[what];
  }

  // wrapped functions
  getGameMode() {
    return this.world.getGameMode();
  }

  changeGameMode(gameMode) {
    this.world.changeGameMode(gameMode);
    this.dbMap.worldState.update({_id: 'gameMode', state: gameMode})
  }

  initNodeType(type) {
    this.world.initNodeType(type);
  }


  setNode(id, node, type) {
    this.world.setNode(id, node, type);
    let data = node.toJSON();
    data.dbType = type;
    this.dbMap.nodes.update(data);
  }

  getNode(id) {
    return this.world.getNode(id);
  }

  getNodes(type) {
    return this.world.getNodes(type)
  }

  getNearestNodeToNode(node, type, radius) {
    return this.world.getNearestNodeToNode(node, type, radius);
  }

  removeNode(id, type) {
    if (isNaN(id)) {
      id = id.id;
    }
    this.world.removeNode(id, type);
    if (type === undefined || type === 'all') {
      this.dbMap.nodes.remove(id.toString());
    } else {
      let data = {_id: id.toString()};
      data.dbType = '-' + type;
      this.dbMap.nodes.update(data);
    }
  }

  getNextPlayerId() {
    // Resets integer
    if (this._nextPlayerId > this._idBlockPlayer + ID_BLOCK_SIZE_PLAYER) {
      this._nextPlayerId = this._nextIdBlockPlayer;
      this._idBlockPlayer = this._nextIdBlockPlayer;
      this.getNextIdBlockPlayer();
    }
    return this._nextPlayerId++;
  }

  getNextNodeId() {
    // Resets integer
    if (this._lastNodeId > this._idBlock + ID_BLOCK_SIZE) {
      this._lastNodeId = this._nextIdBlock;
      this._idBlock = this._nextIdBlock;
      this.updateIdBlocks();
    }
    return this._lastNodeId++;
  }

  setNodeAsMoving(id, node) {
    this.world.setNodeAsMoving(id, node);
  }

  removeMovingNode(id) {
    this.world.removeMovingNode(id)
  }

  getMovingNodes() {
    return this.world.getMovingNodes();
  }

  getRandomPosition() {
    return this.world.getRandomPosition();
  }

  getClients() {
    return this.world.getClients();
  }

  addClient(client) {
    return this.world.addClient(client);
  }

  removeClient(client) {
    this.world.removeClient(client)
  }

  getWorld() {
    // todo remove and fix this
    return this;
  }

  setupIdBlocks() {
    this.dbMap.worldState.get('idBlock', (res)=> {
      if (res.status !== 404) {
        // if idBlock found then use it else use the default and put the next one in the db
        this._idBlock = parseInt(res.doc.idBlock);
      }
      let nextBlock = this.getNextIdBlock(this._nextIdBlock, ID_BLOCK_SIZE, DEFAULT_ID_BLOCK, Number.MAX_SAFE_INTEGER);
      let data = {_id: 'idBlock', idBlock: nextBlock};
      this.dbMap.worldState.put(data);

    })
  }

  updateIdBlocks() {
    this.dbMap.worldState.get('idBlock', (res)=> {
      if (res.status === 404) {
        throw new Error('idBlock not found in DB! This should never happen.');
      }

      this._nextIdBlock = parseInt(res.doc.idBlock);
      let nextBlock = this.getNextIdBlock(this._nextIdBlock, ID_BLOCK_SIZE, DEFAULT_ID_BLOCK, Number.MAX_SAFE_INTEGER);
      let data = {_id: 'idBlock', idBlock: nextBlock};
      this.dbMap.worldState.put(data);
    })
  }

  getNextIdBlock(currentBlock, size, defaultBlock, maxSafe) {
    let nextBlock = currentBlock + size;
    return (nextBlock < (maxSafe - size)) ? nextBlock : defaultBlock;
  }

  setupNextPlayerId() {
    this.dbMap.worldState.get('nextPlayerId', (res)=> {
      if (res.status !== 404) {
        // if found then use it else use the default and put the next one in the db
        this._nextPlayerId = parseInt(res.doc.nextPlayerId);
      }
      let nextId = this.getNextIdBlock(this._nextPlayerId, ID_BLOCK_SIZE_PLAYER, DEFAULT_ID_BLOCK_PLAYER, ID_BLOCK_SIZE_PLAYER_MAX);
      let data = {_id: 'nextPlayerId', nextPlayerId: nextId};
      this.dbMap.worldState.put(data);

    })
  }

  getNextIdBlockPlayer() {
    this.dbMap.worldState.get('nextPlayerId', (res)=> {
      if (res.status === 404) {
        throw new Error('nextPlayerId not found in DB! This should never happen.');
      }

      this._nextPlayerId = parseInt(res.doc.nextPlayerId);
      let nextIdBlock = this.getNextIdBlock(this._nextPlayerId, ID_BLOCK_SIZE_PLAYER, DEFAULT_ID_BLOCK_PLAYER, ID_BLOCK_SIZE_PLAYER_MAX);
      let data = {_id: 'nextPlayerId', nextPlayerId: nextIdBlock};
      this.dbMap.worldState.put(data);
    })
  }


  //@formatter:off
  // es6 getter/setters
  get config () { return this.world.config; }
  get clients () { return this.world.clients; }

  //@formatter:on
};
