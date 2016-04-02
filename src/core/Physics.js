'use strict';
const utilities = require('./utilities.js');

/**
 * Static class with functions to handle physics.
 * @type {Physics}
 */
module.exports = class Physics {
  // all functions must be static

  // todo need to figure out how to use world and not gameServer
  // todo this will take some work/thinking
  static ejectMass(player, world, gameServer) {
    player.cells.forEach((cell)=> {
      if (!cell) return;
      let angle = utilities.getAngleFromClientToCell(client, cell);

      // Get starting position
      let size = cell.getSize() + 5;
      let startPos = {
        x: cell.position.x + ((size + gameServer.config.ejectMass) * Math.sin(angle)),
        y: cell.position.y + ((size + gameServer.config.ejectMass) * Math.cos(angle))
      };

      // Randomize angle
      angle += (Math.random() * .4) - .2;

      // Create cell
      let ejected = new Entity.EjectedMass(world.getNextNodeId(), null, startPos, -100, gameServer);
      ejected.setAngle(angle);
      ejected.setMoveEngineData(this.config.ejectantispeed, 20);
      ejected.setColor(cell.getColor());

      gameServer.addNode(ejected, "moving");

    });
  }

};
