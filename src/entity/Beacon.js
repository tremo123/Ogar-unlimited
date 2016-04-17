'use strict';
const Cell = require('./Cell');
const EjectedMass = require('./EjectedMass');
const MotherCell = require('./MotherCell');
const MovingVirus = require('./MovingVirus');
const utilities = require('../core/utilities.js');

module.exports = class Beacon extends Cell {
  constructor(nodeId, owner, position, mass, world, config) {
    super(nodeId, owner, position, mass, world, config);

    this.cellType = 5; // Another new cell type
    this.wobbly = true; // Drawing purposes
    this.spiked = 1;

    this.stage = 0; // When it reaches 1000, kill largest player
    this.maxStage = 250;
    this.minMass = this.mass;

    this.color = {
      r: 255,
      g: 255,
      b: 255
    };
  }


  feed(feeder, world) {
    // Increase the stage ('voltage' if you will)
    if (Math.floor(Math.random * 100) > 50) {
      this.stage++;
    }
    if (Math.floor(Math.random * 100) > 50) {
      this.stage++;
    }
    this.stage++;
    this.mass = this.minMass + this.stage;

    // Spit out a nutrient
    this.spawnFood(world);

    // Sometimes spit out a ejected mass
    if (Math.random() < 0.25) {
      this.spawnEjected(world, utilities.getRandomColor());
    }

    // Even more rarely spit out a moving virus
    // Spit out a moving virus in deterministic direction
    // every 20 shots
    if (this.stage % 20 === 0) {
      var moving = new MovingVirus(
        world.getNextNodeId(),
        null, {
          x: this.position.x,
          y: this.position.y
        },
        125, // mass
        world,
        this.config
      );
      moving.angle = feeder.angle;
      moving.setMoveEngineData(20 + 10 * Math.random(), Infinity, 1);
      world.setNode(moving.getId(), moving, 'moving');
    }

    if (this.stage >= this.maxStage) {
      // Kill largest player and reset stage
      this.stage = 0;

      var largest = gameServer.leaderboard[0];
      var color = gameServer.getRandomColor();
      if (largest) {
        color = largest.color;
        // Do something to each of their cells:
        for (var i = 0; i < largest.cells.length; i++) {
          var cell = largest.cells[i];
          while (cell.mass > 10) {
            cell.mass -= this.config.ejectMassLoss;
            // Eject a mass in random direction
            var ejected = new EjectedMass(
              world.getNextNodeId(),
              null, {
                x: cell.position.x,
                y: cell.position.y
              },
              this.config.ejectMass,
              this.world,
              this.config
            );
            ejected.setAngle(6.28 * Math.random()); // Random angle [0, 2*pi)
            ejected.setMoveEngineData(
              Math.random() * gameServer.config.ejectSpeed,
              35,
              0.5 + 0.4 * Math.random()
            );
            ejected.setColor(cell.getColor());
            gameServer.addNode(ejected, "moving");
            gameServer.getWorld().setNodeAsMoving(ejected.getId(), ejected);
          }
          cell.mass = 10;
        }
      }

      // Give back mass
      for (var i = 0; i < this.maxStage / 4; i++) {
        this.spawnEjected(gameServer, color);
      }

      this.mass = this.minMass;
    }

    // Indicate stage via color
    this.color = {
      r: 255 * (1 - this.stage / this.maxStage),
      g: 255 * (1 - this.stage / this.maxStage),
      b: 255 * (1 - this.stage / (2 * this.maxStage))
    };

    this.world.removeNode(feeder);
  };

  onAdd(gameServer) {
    gameServer.getWorld().getGameMode().beacon = this;
  };

  // todo copied from mothercell
  visibleCheck(box, centerPos) {
    // Checks if this cell is visible to the player
    var cellSize = this.getSize();
    var lenX = cellSize + box.width >> 0; // Width of cell + width of the box (Int)
    var lenY = cellSize + box.height >> 0; // Height of cell + height of the box (Int)

    return (this.abs(this.position.x - centerPos.x) < lenX) && (this.abs(this.position.y - centerPos.y) < lenY);
  };

  // todo copied from mothercell
  spawnFood(world) {
    // Get starting position
    var angle = Math.random() * 6.28; // (Math.PI * 2) ??? Precision is not our greatest concern here
    var r = this.getSize();
    var pos = {
      x: this.position.x + (r * Math.sin(angle)),
      y: this.position.y + (r * Math.cos(angle))
    };

    // Spawn food
    var f = new Food(world.getNextNodeId(), null, pos, this.config.foodMass, world, world.config);
    f.setColor(utilities.getRandomColor());

    world.setNode(f.getId(), f, 'food');

    // Move engine
    f.angle = angle;
    var dist = (Math.random() * 10) + 22; // Random distance
    f.setMoveEngineData(dist, 15);

    world.setNode(f.getId(), f, 'moving');
  };

  spawnEjected(world, parentColor) {
    // Get starting position
    var angle = Math.random() * 6.28; // (Math.PI * 2) ??? Precision is not our greatest concern here
    var r = this.getSize();
    var pos = {
      x: this.position.x + (r * Math.sin(angle)),
      y: this.position.y + (r * Math.cos(angle))
    };

    // Spawn food
    var f = new EjectedMass(world.getNextNodeId(), null, pos, world.config.ejectMass, world, this.config);
    f.setColor(parentColor);

    world.setNode(f.getId(), f, 'food');

    // Move engine
    f.angle = angle;
    var dist = (Math.random() * 25) + 5; // Random distance
    f.setMoveEngineData(dist, 15);

    world.setNode(f.getId(), f, 'moving');
  };
};
