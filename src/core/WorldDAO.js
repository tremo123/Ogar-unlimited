'use strict';
const WorldModel = require('./WorldModel.js');
const DataBaseConnector = require('./DataBaseConnector.js');
const Entity = require('../entity');

module.exports = class WorldDAO {
  constructor() {
    this.world = new WorldModel();
    this.dataBase = new DataBaseConnector('world');

    this.listeners = {
      gameMode: [],
      nodes: [],
      clients: []
    };

    this.dataBase.onChange((data)=>{
      this.onDbChange(data);
    });

  }

  onDbChange(data){


    if (data.action === 'test') {
      this[data.action](data.data);
      return;
    }

    if (data.id === 'gameMode') {
      //this.world.changeGameMode(data.doc.data);
      return;
    }

    if (data.id.includes('node')) {
      let id = parseInt(data.doc._id.slice(4), 10);
      // todo do something
      return;
    }

    if (data.id.includes('client')) {
      let id = parseInt(data.doc._id.slice(6), 10);
      // todo do something
      return;
    }

    console.error('[WorldDAO.onDbChange] Unknown data type for: ' + data.doc.id + ' data: ' + data.doc.data);
  }

  sync(id, action, args) {
    this.dataBase.update({_id: id, action: action, data: args});
  }

  // todo need to rethink this for world model
  registerListner(what, func){
    this.listeners[what].push(func);
    return this[what];
  }

  test(id, node, type) {
    if (typeof id === 'object'){
      node = id.node;
      type = id.type;
      id = id._id;
    }
    console.log(id);
    console.log(node);
    console.log(node.toJSON());
    console.log(type);
  }

  // wrapped functions
  getGameMode() {
    return this.world.getGameMode();
  }

  changeGameMode(gameMode) {
    this.world.changeGameMode(gameMode);
    this.dataBase.update({_id: 'gameMode', data: gameMode})
  }

  initNodeType(type) {
    this.world.initNodeType(type);
  }

  setNode(id, node, type) {
    this.world.setNode(id, node, type);
    console.log('setNode node' + id + ' test ' + {_id: id, node: node, type: type});
    this.sync('node' + id, 'test', {_id: id, node: node, type: type});
  }


  addNode(node, type) {
    this.world.addNode(node, type);
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
    this.world.removeNode(id, type);
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

  // es6 getter/setters
  get config () { return this.world.config; }

};
