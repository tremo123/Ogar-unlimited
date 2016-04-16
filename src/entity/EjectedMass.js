'use strict';
const Cell = require('./Cell');

module.exports = class EjectedMass extends Cell {

  constructor(nodeId, owner, position, mass, world, config) {
    super(nodeId, owner, position, mass, world, config);
    this.cellType = 3;
    this.size = Math.ceil(Math.sqrt(100 * this.mass));
    this.squareSize = (100 * this.mass) >> 0; // not being decayed -> calculate one time
  }

  getSize() {
    return this.size;
  };

  getSquareSize() {
    return this.squareSize;
  };

  calcMove() {
  }// Only for player controlled movement

// Main Functions

  sendUpdate() {
    // Whether or not to include this cell in the update packet
    return this.moveEngineTicks != 0;
  };

  onRemove(world) {
    // Remove from list of ejected mass
    //gameServer.removeEjectedNode(this);
  };

  onConsume(consumer, world) {
    // Adds mass to consumer
    consumer.addMass(this.mass);
  };

  onAutoMove(world) {
    // Check for a beacon if experimental
    var beacon = world.getGameMode().beacon;
    if (world.getGameMode().ID === 8 && beacon && this.collisionCheck2(beacon.getSquareSize(), beacon.position)) {
      // The beacon has been feed
      beacon.feed(this, world);
      return true;
    }

    let virusNodes = world.getNodes('virus');
    if (virusNodes.length < world.config.virusMaxAmount) {
      // Check for viruses
      var v = world.getNearestNodeToNode(this, 'virus');
      if (v) { // Feeds the virus if it exists
        v.feed(this, world);
        return true;
      }
    }
  };

  moveDone(world) {
    this.onAutoMove(world);
  };

  onAdd(gameServer) {
    //gameServer.addEjectedNodes(this);
  };
}
