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

  update() {
    let toSpawn = Math.min(this.config.foodSpawnAmount, (this.config.foodMaxAmount - this.gameServer.currentFood));
    for (let i = 0; i < toSpawn; i++) {
      this.spawnFood();
    }
    this.virusCheck();
  }

  spawnFood() {
    let f = new Entity.Food(this.gameServer.getNextNodeId(), null, utilities.getRandomPosition(this.config.borderRight, this.config.borderLeft, this.config.borderBottom, this.config.borderTop), this.config.foodMass, this.gameServer);
    f.setColor(utilities.getRandomColor());

    this.gameServer.addNode(f);
    this.gameServer.currentFood++;
  };
  virusCheck() {
    // Checks if there are enough viruses on the map
    if (this.gameServer.spawnv == 1) {
      let virusNodes = this.gameServer.getVirusNodes();
      if (virusNodes.length < this.config.virusMinAmount) {
        // Spawns a virus
        var pos = utilities.getRandomPosition(this.config.borderRight, this.config.borderLeft, this.config.borderBottom, this.config.borderTop);
        var virusSquareSize = (this.config.virusStartMass * 100) >> 0;

        // Check for players
        let nodesPlayer = this.gameServer.getNodesPlayer();
        for (var i = 0; i < nodesPlayer.length; i++) {
          let check = nodesPlayer[i];

          if (check.mass < this.config.virusStartMass) {
            continue;
          }

          var squareR = check.getSquareSize(); // squared Radius of checking player cell

          var dx = check.position.x - pos.x;
          var dy = check.position.y - pos.y;

          if (dx * dx + dy * dy + virusSquareSize <= squareR)
            return; // Collided
        }

        // Spawn if no cells are colliding
        var v = new Entity.Virus(this.gameServer.getNextNodeId(), null, pos, this.config.virusStartMass);
        this.gameServer.addNode(v);
      }
    }
  };


};
