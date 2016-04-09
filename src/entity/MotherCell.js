'use strict';
var Cell = require('./Cell');
var Virus = require('./Virus');
var Food = require('./Food');
const utilities = require('../core/utilities.js');

function MotherCell() { // Temporary - Will be in its own file if Zeach decides to add this to vanilla
  Cell.apply(this, Array.prototype.slice.call(arguments));

  this.cellType = 2; // Copies virus cell
  this.color = {
    r: 190 + Math.floor(30 * Math.random()),
    g: 70 + Math.floor(30 * Math.random()),
    b: 85 + Math.floor(30 * Math.random())
  };
  this.spiked = 1;
  this.mass = 222;
}

module.exports = MotherCell;
MotherCell.prototype = new Cell(); // Base

MotherCell.prototype.getEatingRange = function () {
  return this.getSize() * 0.5;
};

MotherCell.prototype.update = function (world) {
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

MotherCell.prototype.checkEat = function (world) {
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

MotherCell.prototype.abs = function (n) {
  // Because Math.abs is slow
  return (n < 0) ? -n : n;
};

MotherCell.prototype.spawnFood = function (world) {
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

MotherCell.prototype.onConsume = Virus.prototype.onConsume; // Copies the virus prototype function

MotherCell.prototype.onAdd = function (world) {
  //world.setNode(this.getId(), this, 'mothercell');
  //gameServer.getWorld().getGameMode().nodesMother.push(this); // Temporary
};

MotherCell.prototype.onRemove = function (world) {
  var index = world.getGameMode().nodesMother.indexOf(this);
  if (index != -1) {
    world.getGameMode().nodesMother.splice(index, 1);
  }

};

MotherCell.prototype.visibleCheck = function (box, centerPos) {
  // Checks if this cell is visible to the player
  var cellSize = this.getSize();
  var lenX = cellSize + box.width >> 0; // Width of cell + width of the box (Int)
  var lenY = cellSize + box.height >> 0; // Height of cell + height of the box (Int)

  return (this.abs(this.position.x - centerPos.x) < lenX) && (this.abs(this.position.y - centerPos.y) < lenY);
};
