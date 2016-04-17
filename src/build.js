'use strict';
var Commands = require('./modules/CommandList');
var GameServer = require('./core/GameServer');

var gameServer = new GameServer();

const VERSION = 'buildTest';
const ControlServer = require('./core/ControlServer');
let controlServer = new ControlServer(VERSION);

// There is no stopping an exit so clean up
// NO ASYNC CODE HERE - only use SYNC or it will not happen
process.on('exit', (code) => {
  console.log("OgarUnlimited terminated with code: " + code);
  controlServer.stop();
});

// init/start the control server
controlServer.init();
controlServer.start();


setTimeout(function () {
  process.exit(0);
}, 60000);

process.exit(0);
