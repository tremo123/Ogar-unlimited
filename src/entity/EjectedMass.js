'use strict';
var Cell = require('./Cell');

function EjectedMass() {
  Cell.apply(this, Array.prototype.slice.call(arguments));

  this.cellType = 3;
  this.size = Math.ceil(Math.sqrt(100 * this.mass));
  this.squareSize = (100 * this.mass) >> 0; // not being decayed -> calculate one time
}

module.exports = EjectedMass;
EjectedMass.prototype = new Cell();

EjectedMass.prototype.getSize = function () {
  return this.size;
};

EjectedMass.prototype.getSquareSize = function () {
  return this.squareSize;
};

EjectedMass.prototype.calcMove = null; // Only for player controlled movement

// Main Functions

EjectedMass.prototype.sendUpdate = function () {
  // Whether or not to include this cell in the update packet
  return this.moveEngineTicks != 0;
};

EjectedMass.prototype.onRemove = function (world) {
  // Remove from list of ejected mass
  //gameServer.removeEjectedNode(this);
};

EjectedMass.prototype.onConsume = function (consumer, world) {
  // Adds mass to consumer
  consumer.addMass(this.mass);
};

EjectedMass.prototype.onAutoMove = function (world) {
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

EjectedMass.prototype.moveDone = function (world) {
  this.onAutoMove(world);
};

EjectedMass.prototype.onAdd = function (gameServer) {
  //gameServer.addEjectedNodes(this);
};
