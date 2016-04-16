'use strict';
const Cell = require('./Cell');

module.exports = class Food extends Cell {
  constructor(nodeId, owner, position, mass, world, config) {
    super(nodeId, owner, position, mass, world, config);
    this.cellType = 1;
    this.size = Math.ceil(Math.sqrt(100 * this.mass));
    this.squareSize = (100 * this.mass) >> 0; // not being decayed -> calculate one time
    this.shouldSendUpdate = false;

    if (this.config.foodMassGrow &&
      this.config.foodMassGrowPossiblity > Math.floor(Math.random() * 101)) {
      this.grow();
    }
  }

  getSize() {
    return this.size;
  };

  getSquareSize() {
    return this.squareSize;
  };

  calcMove() {
  } // Food has no need to move

// Main Functions

  grow() {
    setTimeout(function () {
      this.mass++; // food mass increased, we need to recalculate its size and squareSize, and send update to client side
      this.size = Math.ceil(Math.sqrt(100 * this.mass));
      this.squareSize = (100 * this.mass) >> 0;
      this.shouldSendUpdate = true;

      if (this.mass < this.config.foodMassLimit) {
        this.grow();
      }
    }.bind(this), this.config.foodMassTimeout * 1000);
  }

  sendUpdate() {
    // Whether or not to include this cell in the update packet
    if (this.moveEngineTicks == 0) {
      return false;
    }
    if (this.shouldSendUpdate) {
      this.shouldSendUpdate = false;
      return true;
    }
    return true;
  }

  onRemove(world) {

  }

  onConsume(consumer) {
    consumer.addMass(this.mass);
  }
};
