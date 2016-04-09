'use strict';
// This is our shared data type. It contains all of the data about the state of the would that needs to be shared
// among our processes.
const Cell = require('../entity/Cell.js');
const SortedMap = require("collections/sorted-map");
const Packet = require('../packet');
const Gamemode = require('../gamemodes');

'use strict';
module.exports = class WorldModel {
  constructor(config, borderRight, borderLeft, borderBottom, borderTop) {
    this.config = config;
    this.borderRight = borderRight;
    this.borderLeft = borderLeft;
    this.borderBottom = borderBottom;
    this.borderTop = borderTop;

    // id's are shared: player 1-10000, all other nodes 10001-2147483647
    this.lastPlayerId = 1;
    this.lastNodeId = 10001;
    this.nodeMaps = [];
    this.nodeMaps['node'] = new SortedMap();

//    this.nodes = new SortedMap();
//    this.movingNodes = new SortedMap();


    this.clients = []; // todo change this to a Map or SortedMap

    // Gamemodes
    this.gameMode = Gamemode.get(this.config.serverGamemode, this);
    //this.pluginGamemodes = this.pluginLoader.getPGamemodes();
  }

  getGameMode() {
    return this.gameMode;
  }

  changeGameMode(gameMode) {
    this.gameMode = gameMode;
  }

  initNodeType(type) {
    if (type === 'node') return;
    this.nodeMaps[type] = new SortedMap();
  }

  setNode(id, node, type) {
    type = (type) ? type : 'node';
    if (!this.nodeMaps[type]) {
      this.nodeMaps[type] = new SortedMap();
    }
    this.nodeMaps['node'].set(id, node);
    this.nodeMaps[type].set(id, node);


    // Adds to the owning player's screen
    if (node.owner) {
      node.setColor(node.owner.color);
      node.owner.cells.push(node);
      node.owner.socket.sendPacket(new Packet.AddNode(node));
    }

    // Special on-add actions
    node.onAdd(this);

    // todo Rewrite this - this is business logic in a model
    // Add to visible nodes
    this.clients.forEach((client)=> {
      let tracker = client.playerTracker;
      if (!tracker) return;

      // todo memory leak?
      // client.nodeAdditionQueue is only used by human players, not bots
      // for bots it just gets collected forever, using ever-increasing amounts of memory
      if ('_socket' in tracker.socket && node.visibleCheck(tracker.viewBox, tracker.centerPos)) {
        tracker.nodeAdditionQueue.push(node);
      }
    });
  }

  addNode(node, type) {
    let id = this.getNewNodeId();
    this.setNode(id, node, type);
    return id;
  }

  getNode(id) {
    return this.nodeMaps['node'].get(id);
  }

  getNodes(type) {
    return this.nodeMaps[(type) ? type : 'node'];
  }

  getNearestNodeToNode(node, type, radius) {
    let nodes = this.getNodes(type);

    // More like getNearbyVirus
    let foundNode = undefined;
    let r = (radius) ? radius : 100; // Checking radius

    let topY = node.position.y - r;
    let bottomY = node.position.y + r;

    let leftX = node.position.x - r;
    let rightX = node.position.x + r;

    // Loop through all nodes on the map. There is probably a more efficient way of doing this
    nodes.some((check)=> {
      //if (typeof check === 'undefined') return false;
      if (!check || !check.collisionCheck(bottomY, topY, rightX, leftX)) return false;

      // Add to list of cells nearby
      foundNode = check;
      return true; // stop checking when a virus found
    });
    return foundNode;

  }

  removeNode(id, type) {
    if (isNaN(id)) id = id.getId();

    type = (type) ? type : 'all';
    type = (type === 'node') ? 'all' : type;

    let node = this.nodeMaps['node'].get(id);
    if (type == 'all') {
      Object.keys(this.nodeMaps).forEach((key)=>this.nodeMaps[key].delete(id));

      // todo Rewrite this - this is business logic in a model
      // Animation when eating
      let clients = this.getClients();
      for (let i = 0; i < clients.length; i++) {
        let client = clients[i].playerTracker;
        if (!client) {
          console.log('client is undefined?');
          continue;
        }

        // Remove from client
        client.nodeDestroyQueue.push(node);
      }

    } else {
      this.nodeMaps[type].delete(id);
    }
  }

  getNextPlayerId() {
    if (this.lastPlayerId > 10000) {
      this.lastPlayerId = 1;
    }
    return this.lastPlayerId++;
  }

  getNewNodeId() {
    // Resets integer
    if (this.lastNodeId > 2147483647) {
      this.lastNodeId = 10001;
    }
    return this.lastNodeId++;
  }

  getNextNodeId() {
    return this.getNewNodeId();
  }

  setNodeAsMoving(id, node) {
    this.setNode(id, node, 'moving');
  }

  removeMovingNode(id) {
    this.removeNode(id, 'moving');
  }

  getMovingNodes() {
    return this.nodeMaps['moving'];
  }

  getRandomPosition() {
    return {
      x: Math.floor(Math.random() * (this.borderRight - this.borderLeft)) + this.borderLeft,
      y: Math.floor(Math.random() * (this.borderBottom - this.borderTop)) + this.borderTop
    }
  }

  getClients() {
    return this.clients;
  }

  addClient(client) {
    return this.clients.push(client);
  }

  removeClient(client) {
    let index = this.clients.indexOf(client);
    if (index != -1) {
      this.clients.splice(index, 1);
    }
  }

  getWorld() {
    // todo remove and fix this
    return this;
  }
};

