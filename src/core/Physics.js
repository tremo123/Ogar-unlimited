'use strict';
const utilities = require('./utilities.js');
//const Entity = require('../entity');

/**
 * Static class with functions to handle physics.
 * @type {Physics}
 */
module.exports = class Physics {
  // all functions must be static

  static ejectMass(newType, player, world, mass) {
    player.cells.forEach((cell)=> {
      if (!cell) return;
      let angle = Physics.getAngleFromTo(player.mouse, cell.position);

      // Get starting position
      let size = cell.getSize() + 5;
      let startPos = {
        x: cell.position.x + ((size + mass) * Math.sin(angle)),
        y: cell.position.y + ((size + mass) * Math.cos(angle))
      };

      // Randomize angle
      angle += (Math.random() * .4) - .2;

      // Create cell
      let ejected = new newType(world.getNextNodeId(), null, startPos, -100, world);
      ejected.setAngle(angle);
      ejected.setMoveEngineData(gameServer.config.ejectantispeed, 20);
      ejected.setColor(cell.getColor());

      world.setNode(ejected.getId(), ejected, "moving");
      world.setNode(ejected.getId(), ejected, "ejected");

    });
  }

  // todo needs more work, should work on anything we might want to split, player/bots/anything
  static splitCells(newType, player, world) {
    if (player.frozen || (!player.verify && world.config.verify === 1)) return;

    let splitCells = 0; // How many cells have been split
    player.cells.forEach((cell)=> {
      if (!cell) return;
      // Player cell limit
      if (player.cells.length >= world.config.playerMaxCells) return;

      if (cell.mass < world.config.playerMinMassSplit) return;

      // Get angle
      let angle = Physics.getAngleFromTo(player.mouse, cell.position);
      if (angle == 0) angle = Math.PI / 2;

      // Get starting position
      let startPos = {
        x: cell.position.x,
        y: cell.position.y
      };
      // Calculate mass and speed of splitting cell
      let newMass = cell.mass / 2;
      cell.mass = newMass;

      // Create cell
      let split = new newType(world.getNextNodeId(), player, startPos, newMass, world);
      split.setAngle(angle);

      let splitSpeed = world.config.splitSpeed;
      split.setMoveEngineData(splitSpeed, 40, 0.85); //vanilla agar.io = 130, 32, 0.85
      split.calcMergeTime(world.config.playerRecombineTime);
      split.ignoreCollision = true;
      split.restoreCollisionTicks = world.config.cRestoreTicks; //vanilla agar.io = 10

      // Add to moving cells list
      world.setNode(split.getId(), split, "moving");
      world.setNode(split.getId(), split, "player");
      splitCells++;
    });
    if (splitCells > 0) player.actionMult += 0.5; // Account anti-teaming

  }

  autoSplit(newType, client, parent, angle, mass, speed, world, cRestoreTicks) {
    // Starting position
    let startPos = {
      x: parent.position.x,
      y: parent.position.y
    };

    // Create cell
    let newCell = new newType(world.getNextNodeId(), client, startPos, mass, world);
    newCell.setAngle(angle);
    newCell.setMoveEngineData(speed, 15);
    newCell.restoreCollisionTicks = 25;
    newCell.calcMergeTime(this.config.playerRecombineTime);
    newCell.ignoreCollision = true; // Remove collision checks
    newCell.restoreCollisionTicks = cRestoreTicks; //vanilla agar.io = 10
    // Add to moving cells list
    world.setNode(newCell.getId(), newCell, "moving");
  };

  /**
   * Returns the angle from {from} to {to}
   * @param from object with an x and y
   * @param to object with an x and y
   * @returns {number} angle
   */
  static getAngleFromTo(from, to) {
    return Math.atan2((from.x - to.x), (from.y - to.y));
  }

  /**
   * Returns the distance from {from} to {to}
   * @param from object with an x and y
   * @param to object with an x and y
   * @returns {number} distance
   */
  static getDist(from, to) { // Use Pythagoras theorem
    let deltaX = Math.abs(from.x - to.x);
    let deltaY = Math.abs(from.y - to.y);
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }
};
