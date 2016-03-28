'use strict';
// This is our shared data type. It contains all of the data about the state of the would that needs to be shared
// among our processes.
const Cell = require('../entity/Cell.js');
const SortedMap = require("collections/sorted-map");

'use strict';
module.exports = class WorldModel {
  constructor() {
    this.lastNodeId = 2;    // todo why 2?
    this.nodes = new SortedMap();
    this.movingNodes = new SortedMap();
    this.playerNodes = SortedMap();
  }

  setNode(id, node, type) {
    this.nodes.set(id, node);
    switch (type) {
      case "player":
        this.playerNodes.set(id, node);
        break;
      case "moving":
        this.setNodeAsMoving(id, node);
        break;
    }
  }

  addNode(node, type) {
    let id = this.getNewNodeId();
    this.setNode(id, node, type);
    return id;
  }

  getNode(id) {
    return this.nodes.get(id);
  }

  getNodes() {
    return this.nodes;
  }

  removeNode(id) {
    this.nodes.delete(id);
    this.movingNodes.delete(id);
    this.playerNodes.delete(id);
  }

  getNewNodeId() {
    // Resets integer
    if (this.lastNodeId > 2147483647) {
      this.lastNodeId = 1;
    }
    return this.lastNodeId++;
  }

  setNodeAsMoving(id, node) {
    this.movingNodes.set(id, node);
  }

  removeMovingNode(id) {

    this.movingNodes.delete(id);
  }

  getMovingNodes() {
    return this.movingNodes;
  }

  getPlayerNodes() {
    return this.playerNodes;
  }

};

