// Imports
var GameServer = require('./GameServer');
var ConsoleService = require('./core/ConsoleService.js');
var request = require('request');

var Version = '11.8.5';
var gameServer = new GameServer();
var consoleService = new ConsoleService(gameServer);

// Init variables
var showConsole = true;

// start the consoleService
consoleService.start();

// Handle arguments
process.argv.forEach(function (val) {
  if (val == "--noconsole") {
    showConsole = false;
  } else if (val == "--help") {
    console.log("Proper Usage: node index.js");
    console.log("    --noconsole         Disables the console");
    console.log("    --help              Help menu.");
    console.log("");
  }
});

// Run Ogar

gameServer.start(Version);

// Add command handler
gameServer.commands = consoleService.commands.list;

// Initialize the server console
if (showConsole) {
  var readline = require('readline');
  var in_ = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  setTimeout(consoleService.prompt(in_), 100);
}
