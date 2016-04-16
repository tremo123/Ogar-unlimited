'use strict';
const Virus = require('./Virus');

module.exports = class MovingVirus extends Virus {
  constructor(nodeId, owner, position, mass, world, config) {
    super(nodeId, owner, position, mass, world, config);

    this.color = {
      r: 104 + Math.floor(48 * Math.random()),
      g: 0,
      b: 40 + Math.floor(48 * Math.random())
    };
    this.angle = 3.14 * Math.random();
    this.setMoveEngineData(2 + 4 * Math.random(), Infinity, 1);
  }

// Unlike original viruses, these don't grow and split.  They move
  feed(feeder, world) {
    // Just a bunch of inelastic collision (momentum) equations
    var m1 = feeder.mass * 0.25; // * 0.25 because it gets a little crazy otherwise
    var m2 = this.mass;
    var v1 = feeder.moveEngineSpeed;
    var v2 = this.moveEngineSpeed;
    var theta1 = feeder.angle;
    var theta2 = this.angle;

    var px = m1 * v1 * Math.cos(theta1) + m2 * v2 * Math.cos(theta2);
    var py = m1 * v1 * Math.sin(theta1) + m2 * v2 * Math.sin(theta2);

    this.angle = Math.atan2(py, px);
    var newSpeed = Math.sqrt(px * px + py * py) / m2;

    this.setMoveEngineData(newSpeed, Infinity, 1);

    // Remove the feeder
    world.removeNode(feeder);
  };

  onAutoMove(world) {
    // Called on each auto move engine tick
  };

  onAdd(world) {
    world.getGameMode().movingVirusCount++;
    //gameServer.addVirusNodes(this);
  };

  onRemove(world) {
    world.getGameMode().movingVirusCount--;
    //gameServer.removeVirusNode(this);
  }
}
