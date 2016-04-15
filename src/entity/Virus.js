'use strict';
var Cell = require('./Cell');
var EjectedMass = require('../entity/EjectedMass');

function Virus() {
  Cell.apply(this, Array.prototype.slice.call(arguments));

  this.cellType = 2;
  this.spiked = 1;
  this.fed = 0;
  this.wobbly = 0; // wobbly effect
  this.isMotherCell = false; // Not to confuse bots
  this.par;
}

module.exports = Virus;

Virus.prototype = new Cell();


Virus.prototype.calcMove = null; // Only for player controlled movement

Virus.prototype.feed = function (feeder, world) {
  this.setAngle(feeder.getAngle()); // Set direction if the virus explodes
  this.mass += feeder.mass;
  this.fed++; // Increase feed count
  world.removeNode(feeder);

  // Check if the virus is going to explode
  if (this.fed >= this.config.virusFeedAmount) {
    this.mass = this.config.virusStartMass; // Reset mass
    this.fed = 0;
    this.shootVirus(this, world);
  }

};

Virus.prototype.shootVirus = function (parent, world) {
  let parentPos = {
    x: parent.position.x,
    y: parent.position.y
  };

  let newVirus = new Virus(world.getNextNodeId(), null, parentPos, this.config.virusStartMass, world, this.config);
  newVirus.setAngle(parent.getAngle());
  newVirus.setMoveEngineData(200, 20);

  // Add to moving cells list
  world.addNode(newVirus, "moving");
  world.addNode(newVirus, "virus");
};

Virus.prototype.ejectVirus = function (parent, owner, color) {
  let parentPos = {
    x: parent.position.x,
    y: parent.position.y
  };

  let newVirus = new Virus(this.world.getNextNodeId(), null, parentPos, this.config.virusmass, this.world, this.config);
  newVirus.setAngle(parent.getAngle());
  newVirus.setpar(owner);
  newVirus.mass = 10;
  newVirus.setMoveEngineData(this.config.ejectvspeed, 20);
  if (color) newVirus.color = color; else newVirus.color = owner.color;

  // Add to moving cells list
  this.world.addNode(newVirus, "moving");
};

// Main Functions

Virus.prototype.getEatingRange = function () {
  return this.getSize() * .4; // 0 for ejected cells
};
Virus.prototype.setpar = function (par) {
  this.par = par;

};
Virus.prototype.onConsume = function (consumer, world, gameServer) {
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
};

Virus.prototype.onAdd = function (world) {
  //gameServer.addVirusNodes(this);
};

Virus.prototype.onRemove = function (world) {
  //gameServer.removeVirusNode(this)
};
Virus.prototype.onAutoMove = function (world) {
  var r = 100; // Checking radius

  let ejectedNodes = world.getNodes('ejected').toArray();
  for (var i = 0; i < ejectedNodes.length; i++) {
    var check = ejectedNodes[i];

    var topY = check.position.y - r;
    var bottomY = check.position.y + r;
    var leftX = check.position.x - r;
    var rightX = check.position.x + r;

    if (this.collisionCheck(bottomY, topY, rightX, leftX)) {
      check.angle = this.angle; //make sure new virus shoots in same direction as this virus
      this.feed(check, world);
      i--;
    }
  }
};
