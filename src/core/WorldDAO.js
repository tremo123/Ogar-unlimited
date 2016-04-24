'use strict';
const WorldModel = require('./WorldModel.js');
const DataBaseConnector = require('./DataBaseConnector.js');
const Entity = require('../entity');

module.exports = class WorldDAO {
  constructor() {
    this.world = new WorldModel();
    this.dbMap = {};
    this.dbMap.nodes = new DataBaseConnector('nodes');
    this.dbMap.worldState = new DataBaseConnector('worldState');
    this.dbMap.clients = new DataBaseConnector('clients');

    this.listeners = {
      world: [],
      nodes: [],
      clients: []
    };

    this.dbMap.nodes.onChange((data)=>this.onNodesChange(data));
    this.dbMap.worldState.onChange((data)=>this.onWorldStateChange(data));
    this.dbMap.clients.onChange((data)=>this.onClientsChange(data));

    this.testFlag = true;
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
    console.log('onDbChange ' + data);

    if (data.id === 'gameMode') {
      this.world.changeGameMode(data.doc.state);
      return;
    }

    if (data.id.includes('client')) {
      let id = parseInt(data.doc._id.slice(6), 10);
      // todo do something
      return;
    }

    console.error('[WorldDAO.onDbChange] Unknown data type for: ' + data.doc.id + ' data: ' + data.doc.data);
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
    return this.world.getNextPlayerId();
  }

  getNewNodeId() {
    return this.world.getNewNodeId();
  }

  getNextNodeId() {
    return this.world.getNextNodeId();
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

  //@formatter:off
  // es6 getter/setters
  get config () { return this.world.config; }

  //@formatter:on
};
