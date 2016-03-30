'use strict';
var plugin = [];
plugin.name = ""; // Name of plugin where it would be listed in
plugin.author = "andrews54757"; // author
plugin.command = []; // extra commands
plugin.commandName = []; // extra commands
plugin.addToHelp = [];
plugin.commandName[0] = "tptoplayer";
plugin.addToHelp[0] = "tptoplayer : tps to a player";
plugin.gamemodeId = [];
plugin.gamemode = [];
plugin.version = '1.0.0';
plugin.compatVersion = ''; // compatable with (todo)
plugin.gamemodeId[0] = 80;
plugin.gamemode[0] = require("./sffa.js");




plugin.init = function (gameServer) {
  // init, Used to do stuff such as overriding things
  
  
  
}
plugin.command[0] = require("./tptoplayer.js");
module.exports = plugin;

