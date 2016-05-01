'use strict';
const Physics = require('../core/Physics.js');


//Cell.spi = 0;
//Cell.virusi = 255;
//Cell.recom = 0;

module.exports = class Cell {

  constructor(id, owner, position, mass, world, config) {
    this._id = id;
    this.owner = owner; // playerTracker that owns this cell
    this.color = {
      r: 0,
      g: 255,
      b: 0
    };
    this.name = '';
    this.visible = true;
    this.position = position;
    this.mass = mass; // Starting mass of the cell
    this.world = world;
    this.config = config;

    this.cellType = -1; // 0 = Player Cell, 1 = Food, 2 = Virus, 3 = Ejected Mass
    this.spiked = Cell.spi; // If 1, then this cell has spikes around it
    this.wobbly = 0; // If 1 the cell has a very jiggly cell border

    this.killedBy = undefined; // Cell that ate this cell

    this.moveEngineTicks = 0; // Amount of times to loop the movement function
    this.moveEngineSpeed = 0;
    this.moveDecay = .75;
    this.angle = 0; // Angle of movement

    this._properties = {};  // dynamic map of properties
  }

  toJSON() {
    return {
      _id: this._id.toString(),  // must be a string for pouchdb
      type: this.constructor.name,
      ownerId: (this.owner) ? this.owner.id : undefined,
      color: this.color,
      name: this.name,
      visible: this.visible,
      position: this.position,
      mass: this.mass,
      cellType: this.cellType,
      moveEngineTicks: this.moveEngineTicks,
      moveEngineSpeed: this.moveEngineSpeed,
      angle: this.angle,
      properties: this._properties
    }
  }

  updateFromJSON(jData) {
    if (this._id !== jData._id) return;
    this.owner = (json.ownerId) ? this.getWorld().clients.get(json.ownerId) : undefined;
    this.color = jData.color;
    this.name = jData.name;
    this.visible = jData.visible;
    this.position = jData.position;
    this.mass = jData.mass;
    this.cellType = jData.cellType;
    this.moveEngineTicks = jData.moveEngineTicks;
    this.moveEngineSpeed = jData.moveEngineSpeed;
    this.angle = jData.angle;
    this._properties = jData.properties;
  }

  static fromJSON(entityTypes, json, world) {
    let owner = (json.ownerId) ? world.clients.get(json.ownerId) : undefined;
    let newCell = new entityTypes[json.type](json._id, owner, json.position, json.mass, world, world.config);
    newCell.color = json.color;
    newCell.name = json.name;
    newCell.visible = json.visible;
    newCell.cellType = json.cellType;
    newCell.moveEngineTicks = json.moveEngineTicks;
    newCell.moveEngineSpeed = json.moveEngineSpeed;
    newCell.angle = json.angle;
    // todo iterate of the keys to avoid breaking encapsulation
    newCell._properties = json.properties;
    return newCell;
  };

// Fields not defined by the constructor are considered private and need a getter/setter to access from a different class

  getId() {
    return this._id;
  }

  getVis() {
    if (this.owner && !this.visible) {
      return this.owner.visible;
    } else {
      return this.visible;
    }
  }

  setVis(state, so) {
    if (!so && this.owner) {
      this.owner.visible = state;
    } else {
      this.visible = state;
    }
    return true;
  }

  getName() {
    if (this.owner && !this.name) {
      return this.owner.name;
    } else {
      return this.name;
    }
  }

  setName(name, so) {
    if (!so && this.owner) {
      this.owner.name = name;
    } else {
      this.name = name;
    }
    return true;
  }

  getPremium() {
    if (this.owner) {
      return this.owner.premium;
    } else {
      return "";
    }
  }

  setColor(color) {
    this.color.r = color.r;
    this.color.b = color.b;
    this.color.g = color.g;
  }

  getColor() {
    return this.color;
  }

  getType() {
    return this.cellType;
  }

  getSize() {
    // Calculates radius based on cell mass
    return Math.ceil(Math.sqrt(100 * this.mass));
  }

  getSquareSize() {
    // R * R
    return (100 * this.mass) >> 0;
  }

  addMass(n) {
    var client = this.owner;
    let self = this;
    if (!client.verify && this.config.verify == 1) {
      // todo why?

    } else {

      if (this.mass + n > this.config.playerMaxMass && this.owner.cells.length < this.config.playerMaxCells) {

        this.mass = this.mass + n;
        this.mass = this.mass / 2;
        var randomAngle = Math.random() * 6.28; // Get random angle
        Physics.autoSplit(Entity.PlayerCell, this.owner, this, randomAngle, this.mass, 350, this.world, this.config.cRestoreTicks);
      } else {
        this.mass += n;
        var th = this;

        setTimeout(function () {
          th.mass = Math.min(th.mass, self.config.playerMaxMass);

        }, 1000);

      }
    }
  }

  getSpeed() {
    // Old formula: 5 + (20 * (1 - (this.mass/(70+this.mass))));
    // Based on 50ms ticks. If updateMoveEngine interval changes, change 50 to new value
    // (should possibly have a config value for this?)
    if (this.owner.customspeed > 0) {
      return this.owner.customspeed * Math.pow(this.mass, -1.0 / 4.5) * 50 / 40;

    } else {
      return this.config.playerSpeed * Math.pow(this.mass, -1.0 / 4.5) * 50 / 40;
    }
  }

  setAngle(radians) {
    this.angle = radians;
  }

  getAngle() {
    return this.angle;
  }

  setMoveEngineData(speed, ticks, decay) {
    this.moveEngineSpeed = speed;
    this.moveEngineTicks = ticks;
    this.moveDecay = isNaN(decay) ? 0.75 : decay;
  }

  getEatingRange() {
    return 0; // 0 for ejected cells
  }

  getKiller() {
    return this.killedBy;
  }

  setKiller(cell) {
    this.killedBy = cell;
  }

// Functions

  collisionCheck(bottomY, topY, rightX, leftX) {
    // Collision checking
    if (this.position.y > bottomY) {
      return false;
    }

    if (this.position.y < topY) {
      return false;
    }

    if (this.position.x > rightX) {
      return false;
    }

    if (this.position.x < leftX) {
      return false;
    }

    return true;
  }

// This collision checking function is based on CIRCLE shape
  collisionCheck2(objectSquareSize, objectPosition) {
    // IF (O1O2 + r <= R) THEN collided. (O1O2: distance b/w 2 centers of cells)
    // (O1O2 + r)^2 <= R^2
    // approximately, remove 2*O1O2*r because it requires sqrt(): O1O2^2 + r^2 <= R^2

    var dx = this.position.x - objectPosition.x;
    var dy = this.position.y - objectPosition.y;
    if (Cell.recom == 0) {
      return (dx * dx + dy * dy + this.getSquareSize() <= objectSquareSize);
    } else {
      return (dx * dx + dy * dy <= objectSquareSize);
    }
  }

  visibleCheck(box, centerPos) {
    // Checks if this cell is visible to the player
    return this.collisionCheck(box.bottomY, box.topY, box.rightX, box.leftX);
  }

  calcMovePhys(config) {
    // Movement engine (non player controlled movement)
    var speed = this.moveEngineSpeed;
    var r = this.getSize();
    this.moveEngineSpeed *= this.moveDecay; // Decaying speed
    this.moveEngineTicks--;

    // Calculate new position
    var sin = Math.sin(this.angle);
    var cos = Math.cos(this.angle);
    if (this.cellType == 3) {
      //movement and collision check for ejected mass cells
      var collisionDist = r * 2 - 5; // Minimum distance between the 2 cells (allow cells to go a little inside eachother before moving them)
      var maxTravel = r; //check inbetween places for collisions (is needed when cell still has high speed) - max inbetween move before next collision check is cell radius
      var totTravel = 0;
      var xd = 0;
      var yd = 0;
      do {
        totTravel = Math.min(totTravel + maxTravel, speed);
        var x1 = this.position.x + (totTravel * sin) + xd;
        var y1 = this.position.y + (totTravel * cos) + yd;
        if (this.world) {
          // todo why is the parent class doing stuff with a child class?!?
          this.world.getNodes('ejected').forEach((cell)=> {
            if (this._id == cell.getId()) return;
            if (!this.simpleCollide(x1, y1, cell, collisionDist)) return;

            var dist = this.getDist(x1, y1, cell.position.x, cell.position.y);
            if (dist < collisionDist) { // Collided
              var newDeltaY = cell.position.y - y1;
              var newDeltaX = cell.position.x - x1;
              var newAngle = Math.atan2(newDeltaX, newDeltaY);
              var move = (collisionDist - dist + 5) / 2; //move cells each halfway until they touch
              let xmove = move * Math.sin(newAngle);
              let ymove = move * Math.cos(newAngle);
              cell.position.x += xmove >> 0;
              cell.position.y += ymove >> 0;
              xd += -xmove;
              yd += -ymove;
              if (cell.moveEngineTicks == 0) {
                cell.setMoveEngineData(0, 1); //make sure a collided cell checks again for collisions with other cells
                this.world.setNode(cell.getId(), cell, 'moving');
                //if (!this.gameServer.getMovingNodes().has(cell.getId())) {
                //  this.gameServer.setAsMovingNode(cell.getId());
                //}
              }
              if (this.moveEngineTicks == 0) {
                this.setMoveEngineData(0, 1); //make sure a collided cell checks again for collisions with other cells
              }
            }
          });
        }
      }

        // todo what the hell is this?
      while (totTravel < speed);
      x1 = this.position.x + (speed * sin) + xd;
      y1 = this.position.y + (speed * cos) + yd;

    } else {
      //movement for other than ejected mass cells (player split, virus shoot, ...)
      var x1 = this.position.x + (speed * sin);
      var y1 = this.position.y + (speed * cos);
    }

    // Border check - Bouncy physics
    var radius = 40;
    if ((x1 - radius) < config.borderLeft) {
      // Flip angle horizontally - Left side
      this.angle = 6.28 - this.angle;
      x1 = config.borderLeft + radius;
    }
    if ((x1 + radius) > config.borderRight) {
      // Flip angle horizontally - Right side
      this.angle = 6.28 - this.angle;
      x1 = config.borderRight - radius;
    }
    if ((y1 - radius) < config.borderTop) {
      // Flip angle vertically - Top side
      this.angle = (this.angle <= 3.14) ? 3.14 - this.angle : 9.42 - this.angle;
      y1 = config.borderTop + radius;
    }
    if ((y1 + radius) > config.borderBottom) {
      // Flip angle vertically - Bottom side
      this.angle = (this.angle <= 3.14) ? 3.14 - this.angle : 9.42 - this.angle;
      y1 = config.borderBottom - radius;
    }

    // Set position
    this.position.x = x1 >> 0;
    this.position.y = y1 >> 0;
  }

// Override these

  sendUpdate() {
    // Whether or not to include this cell in the update packet
    return true;
  }

  onConsume(consumer, world) {
    // Called when the cell is consumed
  }

  onAdd(world) {
    // Called when this cell is added to the world
  }

  onRemove(world) {
    // Called when this cell is removed
  }

  onAutoMove(world) {
    // Called on each auto move engine tick
  }

  moveDone(world) {
    // Called when this cell finished moving with the auto move engine
  }

  simpleCollide(x1, y1, check, d) {
    // Simple collision check
    var len = d >> 0; // Width of cell + width of the box (Int)

    return (this.abs(x1 - check.position.x) < len) &&
      (this.abs(y1 - check.position.y) < len);
  }

  abs(x) {
    return x < 0 ? -x : x;
  }

  getDist(x1, y1, x2, y2) {
    var xs = x2 - x1;
    xs = xs * xs;

    var ys = y2 - y1;
    ys = ys * ys;

    return Math.sqrt(xs + ys);
  }

  /**
   * Returns a property that has been set. Will return false if the property is not found.
   * @param name
   * @returns {boolean}
   */
  getProperty(name) {
    return (this._properties[name]) ? this._properties[name] : false;
  }

  /**
   * Sets a property to a given value. If the value is undefined then it is converted to boolean true. If the property does not exist it will create it. Properties are syncable via the toJSON function.
   * @param name
   * @param value - if undefined then the value is set to true.
   */
  setProperty(name, value) {
    value = (value) ? value : true;
    this._properties[name] = value;
  }

  //@formatter:off
  // es6 getter/setters

  get id () { return this._id;}

  //@formatter:on
};
