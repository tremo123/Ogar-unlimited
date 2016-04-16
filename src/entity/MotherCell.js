'use strict';
const Cell = require('./Cell');
const Virus = require('./Virus');
const Food = require('./Food');
const utilities = require('../core/utilities.js');

module.exports = class MotherCell extends Cell {

  constructor(nodeId, owner, position, mass, world, config) {
    super(nodeId, owner, position, mass, world, config);

    this.cellType = 2; // Copies virus cell
    this.color = {
      r: 190 + Math.floor(30 * Math.random()),
      g: 70 + Math.floor(30 * Math.random()),
      b: 85 + Math.floor(30 * Math.random())
    };
    this.spiked = 1;
    this.mass = 222;
  }

  getEatingRange() {
    return this.getSize() * 0.5;
  };

  update(world) {
    // Add mass
    this.mass += 0.25;

    // Spawn food
    if (this.mass >= 222) {
      var maxFoodSpawn = this.config.foodMaxAmount * 10;
      // Spawn food
      var i = 0; // Food spawn counter
      var maxFood = Math.random() * 2;
      while (i < maxFood) {
        if (this.mass === 222 && world.getCurrentFood() < this.config.foodMaxAmount * 1.5) {
          this.spawnFood(world);
        }
        // Only spawn if food cap hasn been reached
        if (world.getCurrentFood() < maxFoodSpawn && this.mass > 222) {
          this.spawnFood(world);
        }
        // Incrementers
        this.mass--;
        i++;
      }

    }
  };

  checkEat(world) {
    var safeMass = this.mass * .9;
    var r = this.getSize(); // The box area that the checked cell needs to be in to be considered eaten

    // Loop for potential prey
    let playerNodes = world.getNodes('player').toArray();
    // todo convert this to a forEach loop so we dont have to convert it to an array
    for (var i in playerNodes) {
      var check = playerNodes[i];

      if (check.mass > safeMass) {
        // Too big to be consumed
        continue;
      }

      // Calculations
      var len = r - (check.getSize() / 2) >> 0;
      if ((this.abs(this.position.x - check.position.x) < len) && (this.abs(this.position.y - check.position.y) < len)) {
        // A second, more precise check
        var xs = Math.pow(check.position.x - this.position.x, 2);
        var ys = Math.pow(check.position.y - this.position.y, 2);
        var dist = Math.sqrt(xs + ys);

        if (r > dist) {
          // Eats the cell
          world.removeNode(check);
          this.mass += check.mass;
        }
      }
    }
    var movingArray = world.getNodes('moving').toArray();
    for (var i in movingArray) {
      var check = movingArray[i];

///    	if ((check.getType() == 1) || (check.mass > safeMass)) {
///            // Too big to be consumed/ No player cells
      if ((check.getType() == 0) || (check.getType() == 1) || (check.mass > safeMass)) {
        // Too big to be consumed / No player cells / No food cells
        continue;
      }

      // Calculations
      var len = r >> 0;
      if ((this.abs(this.position.x - check.position.x) < len) && (this.abs(this.position.y - check.position.y) < len)) {
///
        // A second, more precise check
        var xs = Math.pow(check.position.x - this.position.x, 2);
        var ys = Math.pow(check.position.y - this.position.y, 2);
        var dist = Math.sqrt(xs + ys);
        if (r > dist) {
///
          // Eat the cell
          world.removeNode(check);
          this.mass += check.mass;
        }
      }
    }
  };

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

  // Copies the virus prototype function - todo find a way to not copy
  onConsume(consumer, world, gameServer) {
    var client = consumer.owner;
    if (client != this.par) {
      if (gameServer.troll[this.nodeId - 1] == 1) {

        client.setColor(0); // Set color
        for (var j in client.cells) {
          client.cells[j].setColor(0);
        }
        setTimeout(function () {

          client.name = "Got Trolled:EatMe";
          for (var j in client.cells) {
            client.cells[j].mass = 100;
            client.norecombine = true;
          }
        }, 1000);

        var donot = 1;
        gameServer.troll[this.nodeId] = 0;
      }

      if (gameServer.troll[this.nodeId - 1] == 2) {
        var len = client.cells.length;
        for (var j = 0; j < len; j++) {
          world.removeNode(client.cells[0]);

        }
        var donot = 2;
        gameServer.troll[this.nodeId] = 0;
      }

      if (gameServer.troll[this.nodeId - 1] == 4) {
        var donot = 2;
        var len = client.cells.length;
        for (var j = 0; j < len; j++) {
          world.removeNode(client.cells[0]);
        }
        if (client.socket.remoteAddress) {
          client.nospawn = true;
        } else {
          client.socket.close();
        }
        gameServer.troll[this.nodeId] = 0;
      }

      if (gameServer.troll[this.nodeId - 1] == 3) {
        for (var i = 0; i < client.cells.length; i++) {
          var cell = client.cells[i];
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
              world,
              this.config
            );
            ejected.setAngle(6.28 * Math.random()); // Random angle [0, 2*pi)
            ejected.setMoveEngineData(
              Math.random() * this.config.ejectSpeed,
              35,
              0.5 + 0.4 * Math.random()
            );
            ejected.setColor(cell.getColor());
            world.setNode(ejected.getId(), ejected, "moving");
            world.setNode(ejected.getId(), ejected, "ejected");
          }
          cell.mass = 10;
          var donot = 2;
        }

      }

      if (donot == 2) {
        donot = 0;
      } else {
        // Cell consumes mass and then splits
        consumer.addMass(this.mass);

        var maxSplits = Math.round((0.00010271719068483477) * consumer.mass * consumer.mass - 0.03018601441250582 * consumer.mass + 10.188261351052049); // Maximum amount of splits
        if (maxSplits > this.config.playerMaxCells) {
          maxSplits = this.config.playerMaxCells;
        }
        var numSplits = this.config.playerMaxCells - client.cells.length; // Get number of splits
        numSplits = Math.min(numSplits, maxSplits);
        var splitMass = Math.min(consumer.mass / (numSplits + 1), 36); // Maximum size of new splits

        // Cell cannot split any further
        if (numSplits <= 0) {
          return;
        }

        // Big cells will split into cells larger than 36 mass (1/4 of their mass)
        var bigSplits = 0;
        var endMass = consumer.mass - (numSplits * splitMass);
        if ((endMass > 300) && (numSplits > 0)) {
          bigSplits++;
          numSplits--;
        }
        if ((endMass > 1200) && (numSplits > 0)) {
          bigSplits++;
          numSplits--;
        }
        if ((endMass > 3000) && (numSplits > 0)) {
          bigSplits++;
          numSplits--;
        }

        // Splitting
        var angle = 0; // Starting angle
        for (var k = 0; k < numSplits; k++) {
          angle = Math.random() * 6.28; // Get directions of splitting cells
          gameServer.newCellVirused(client, consumer, angle, splitMass, 150);
          consumer.mass -= splitMass;
        }

        for (var k = 0; k < bigSplits; k++) {
          angle = Math.random() * 6.28; // Random directions
          splitMass = consumer.mass / 4;
          var speed = 0;
          speed = (.000005) * (splitMass * splitMass) + (0.035) * splitMass + 160;
          gameServer.newCellVirused(client, consumer, angle, splitMass, speed);
          consumer.mass -= splitMass;

        }
      }

      // Prevent consumer cell from merging with other cells
      if (donot = 1) {
        donot = 0;

      } else {
        consumer.calcMergeTime(this.config.playerRecombineTime);
        client.actionMult += 0.6; // Account for anti-teaming
      }
      gameServer.troll[this.nodeId] = 0;
    } else {
      consumer.addMass(this.mass)
      gameServer.troll[this.nodeId] = 0;
    }
  }

  onAdd(world) {
    //world.setNode(this.getId(), this, 'mothercell');
    //gameServer.getWorld().getGameMode().nodesMother.push(this); // Temporary
  };

  onRemove(world) {
    var index = world.getGameMode().nodesMother.indexOf(this);
    if (index != -1) {
      world.getGameMode().nodesMother.splice(index, 1);
    }

  };

  visibleCheck(box, centerPos) {
    // Checks if this cell is visible to the player
    var cellSize = this.getSize();
    var lenX = cellSize + box.width >> 0; // Width of cell + width of the box (Int)
    var lenY = cellSize + box.height >> 0; // Height of cell + height of the box (Int)

    return (this.abs(this.position.x - centerPos.x) < lenX) && (this.abs(this.position.y - centerPos.y) < lenY);
  };
};
