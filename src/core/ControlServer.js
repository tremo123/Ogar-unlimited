// This is the main server process that should only ever be called once. It creates and controls the other servers
// as well as controls the communication between them and shares data

const WorldModel = require('./WorldModel');

'use strict';
module.exports = class ControlServer {
  constructor(){
    this.world = new WorldModel();

  }
  init() {

  }
  start(){

  }
  update(dt){

  }
};

