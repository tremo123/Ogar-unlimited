'use strict';
const utilities = require('../core/utilities.js');
const Physics = require('../core/Physics.js');

var Cell = require('./Cell');
var Virus = require('./Virus');
var MotherCell = require('./MotherCell');


module.exports = class StickyCell extends Cell {
  constructor(nodeId, owner, position, mass, world, config) {
    super(nodeId, owner, position, mass, world, config);


    this.cellType = 4; // New cell type
    this.agitated = 1; // Drawing purposes
    this.acquired = undefined;
    this.radius = this.getSize();
    this.color = {
      r: 190 + Math.floor(48 * Math.random()),
      g: 70 + Math.floor(48 * Math.random()),
      b: 85 + Math.floor(48 * Math.random())
    };
    //this.setMoveEngineData(1, Infinity, 1);
  }

  update(world) {
    if (this.acquired) {
      if (this.acquired.killedBy) {
        // Cell was killed and we need to free it
      }

      // Remain attached to the acquired victim
      var check = this.acquired;
      var dist = GameServer.getDist(check.position.x, check.position.y, this.position.x, this.position.y);
      var collisionDist = check.getSize() + this.radius;

      var dY = this.position.y - check.position.y;
      var dX = this.position.x - check.position.x;
      var theta = Math.atan2(dY, dX);
      var dMag = collisionDist - dist - 20; // -20 So it's not ghosting

      this.position.x += (dMag * Math.cos(theta)) >> 0;
      this.position.y += (dMag * Math.sin(theta)) >> 0;

      // Gradually degrade in color
      if (this.color.r > 160) this.color.r *= 0.999;
      if (this.color.g > 40) this.color.g *= 0.999;
      if (this.color.b > 55) this.color.b *= 0.999;
    }

    // Look for victims
    let playerNodes = world.getNodes('player').toArray();
    for (var i in playerNodes) {
      var check = playerNodes[i];

      // Do boundary (non-absorbing) collision check
      var collisionDist = check.getSize() + this.radius;

      if (!check.simpleCollide(check.position.x, check.position.y, this, collisionDist)) {
        check.agitated = false;
        continue;
      }

      // Take away mass from colliders
      if (check.mass > 10) {
        check.mass *= 0.9975;
      }

      if (!this.acquired) {
        // Acquire victim cell if no victim acquired
        this.acquired = check;
      } else if (check != this.acquired &&
        check.mass > this.acquired.mass) {
        // Acquire new victim, if their mass is greater than current victims mass
        this.acquired = check;
      }
    }
  };

  // Special virus mechanics
  feed(feeder, world) {
    world.removeNode(feeder);
    // Pushes the virus
    this.setAngle(feeder.getAngle()); // Set direction if the virus explodes
    this.moveEngineTicks = 5; // Amount of times to loop the movement function
    this.moveEngineSpeed = 30;

    world.setNode(this.getId(), this, 'moving');

  };

  onAdd(world) {
    //gameServer.getWorld().getGameMode().nodesSticky.push(this);
  };

  onConsume(consumer, world) {
    // Explode
    this.virusOnConsume(consumer, world);

    // LOSE mass if it is attached to us, gain otherwise
    // (subtract twice because virusOnConsume already adds mass)
    if (this.acquired && consumer.owner == this.acquired.owner) {
      consumer.mass -= 2 * this.mass;
      if (consumer.mass < 10) {
        consumer.mass = 10;
      }
    }
  };

  // todo copied from virus
  virusOnConsume(consumer, world, gameServer) {
    var client = consumer.owner;
    if (client != this.par) {
      if (gameServer.troll[this._id - 1] == 1) {

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
        gameServer.troll[this._id] = 0;
      }

      if (gameServer.troll[this._id - 1] == 2) {
        var len = client.cells.length;
        for (var j = 0; j < len; j++) {
          world.removeNode(client.cells[0]);

        }
        var donot = 2;
        gameServer.troll[this._id] = 0;
      }

      if (gameServer.troll[this._id - 1] == 4) {
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
        gameServer.troll[this._id] = 0;
      }

      if (gameServer.troll[this._id - 1] == 3) {
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
      gameServer.troll[this._id] = 0;
    } else {
      consumer.addMass(this.mass)
      gameServer.troll[this._id] = 0;
    }
  }

  onRemove(world) {
    var index = world.getGameMode().nodesSticky.indexOf(this);
    if (index != -1) {
      world.getGameMode().nodesSticky.splice(index, 1);
    }
  };

  // todo copied from virus
  visibleCheck(box, centerPos) {
    // Checks if this cell is visible to the player
    var cellSize = this.getSize();
    var lenX = cellSize + box.width >> 0; // Width of cell + width of the box (Int)
    var lenY = cellSize + box.height >> 0; // Height of cell + height of the box (Int)

    return (this.abs(this.position.x - centerPos.x) < lenX) && (this.abs(this.position.y - centerPos.y) < lenY);
  };
};
