var Commands = require('./modules/CommandList');
var GameServer = require('./core/GameServer');

var gameServer = new GameServer();

setTimeout(function () {
  process.exit(0);
}, 60000);

process.exit(0);
