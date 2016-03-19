'use strict';
var utilities = require('./utilities.js');
var Entity = require('../entity');

module.exports = class GeneratorService {
  constructor(gameServer) {
    this.gameServer = gameServer;
    this.config = gameServer.config;

  }

  init() {
    for (var i = 0; i < this.config.foodStartAmount; i++) {
      this.spawnFood();
    }
  }

  start() {

  }

  update(dt) {
    let toSpawn = Math.min(this.config.foodSpawnAmount, (this.config.foodMaxAmount - this.gameServer.currentFood));
    for (let i = 0; i < toSpawn; i++) {
      this.spawnFood();
    }
  }

  spawnFood() {
    let f = new Entity.Food(this.gameServer.getNextNodeId(), null, utilities.getRandomPosition(this.config.borderRight, this.config.borderLeft, this.config.borderBottom, this.config.borderTop), this.config.foodMass, this.gameServer);
    f.setColor(utilities.getRandomColor());

    this.gameServer.addNode(f);
    this.gameServer.currentFood++;
  };

};
