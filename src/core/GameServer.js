'use strict';
const ConfigService = require('./ConfigService.js');
const Gamemode = require('../gamemodes');
const GeneratorService = require('./GeneratorService.js');
const Packet = require('../packet');
const utilities = require('./utilities.js');


module.exports = class GameServer {
  constructor(consoleService){
    // fields
    this.lastNodeId = 1;
    this.lastPlayerId = 1;

    this.nodes = [];
    this.clients = [];
    this.currentFood = 0;
    this.movingNodes = [];

    // services
    this.consoleService = consoleService;
    this.generatorService = new GeneratorService(this);
    this.configService = new ConfigService();

    // Config
    this.config = this.configService.getConfig();
    this.banned = this.configService.getBanned();
    this.opbyip = this.configService.getOpByIp();
    this.highscores = this.configService.getHighScores();
    this.randomNames = this.configService.getBotNames();
    this.skinshortcut = this.configService.getSkinShortCuts();
    this.skin = this.configService.getSkins();

    // Gamemodes
    this.gameMode = Gamemode.get(this.config.serverGamemode);

  }
  init() {

  }
  start(){

  }
  update(dt){

  }
  getNextNodeId() {
    // Resets integer
    if (this.lastNodeId > 2147483647) {
      this.lastNodeId = 1;
    }
    return this.lastNodeId++;
  }
  getNewPlayerID() {
    // Resets integer
    if (this.lastPlayerId > 2147483647) {
      this.lastPlayerId = 1;
    }
    return this.lastPlayerId++;
  }
  getMode() {
    return this.gameMode;
  }
  addNode(node) {
    this.nodes.push(node);

    // Adds to the owning player's screen
    if (node.owner) {
      node.setColor(node.owner.color);
      node.owner.cells.push(node);
      node.owner.socket.sendPacket(new Packet.AddNode(node));
    }

    // Special on-add actions
    node.onAdd(this);

    // Add to visible nodes
    for (var i = 0; i < this.clients.length; i++) {
      var client = this.clients[i].playerTracker;
      if (!client) {
        continue;
      }

      // client.nodeAdditionQueue is only used by human players, not bots
      // for bots it just gets collected forever, using ever-increasing amounts of memory
      if ('_socket' in client.socket && node.visibleCheck(client.viewBox, client.centerPos)) {
        client.nodeAdditionQueue.push(node);
      }
    }
  }
  removeNode(node) {
    // Remove from main nodes list
    var index = this.nodes.indexOf(node);
    if (index != -1) {
      this.nodes.splice(index, 1);
    }

    // Remove from moving cells list
    index = this.movingNodes.indexOf(node);
    if (index != -1) {
      this.movingNodes.splice(index, 1);
    }

    // Special on-remove actions
    node.onRemove(this);

    // Animation when eating
    for (var i = 0; i < this.clients.length; i++) {
      var client = this.clients[i].playerTracker;
      if (!client) {
        continue;
      }

      // Remove from client
      client.nodeDestroyQueue.push(node);
    }
  }
  getRandomSpawn() {
    // Random spawns for players
    var pos;

    if (this.currentFood > 0) {
      // Spawn from food
      var node;
      for (var i = (this.nodes.length - 1); i > -1; i--) {
        // Find random food
        node = this.nodes[i];

        if (!node || node.inRange) {
          // Skip if food is about to be eaten/undefined
          continue;
        }

        if (node.getType() == 1) {
          pos = {
            x: node.position.x,
            y: node.position.y
          };
          this.removeNode(node);
          break;
        }
      }
    }

    if (!pos) {
      // Get random spawn if no food cell is found
      pos = this.getRandomPosition();
    }

    return pos;
  }
  getRandomPosition() {
    return utilities.getRandomPosition(this.config.borderRight, this.config.borderLeft, this.config.borderBottom, this.config.borderTop);
  }
  getRandomColor() {
    return utilities.getRandomColor();
  }
  getDist(x1, y1, x2, y2){
    return utilities.getDist(x1, y1, x2, y2);
  }
  setAsMovingNode(node) {
    this.movingNodes.push(node);
  };
};
