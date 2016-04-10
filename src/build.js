var Commands = require('./modules/CommandList');
var ControlServer = require('./core/ControlServer');

var ControlServer = new ControlServer();

setTimeout(function () {
  process.exit(0);
}, 60000);

process.exit(0);
