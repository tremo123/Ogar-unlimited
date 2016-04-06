const fs = require("fs");
// plugin command
module.exports = function (gameServer, split) {
  if (split[1] == "list") {
    console.log("[Console] --------------- Available Plugins ---------------");
    for (var i in gameServer.plugins) {
      var plugin = gameServer.plugins[i];
      if (plugin && plugin.name && plugin.author && plugin.version) {
        if (plugin.description) console.log("[Console] " + plugin.name + " By " + plugin.author + " version " + plugin.version + "\n      Description: " + plugin.description); else console.log("[Console] " + plugin.name + " By " + plugin.author + " version " + plugin.version + "\n      Description: No description given");


      }


    }
    console.log("[Console] ------------------------------------------------");
  } else if (split[1] == "reload") {
    gameServer.pluginLoader.load();
    console.log("[Console] Reloaded plugins");
  } else if (split[1] == "delete") {
    if(split[2]) {
    gameServer.dfr('../plugins/' + split[2]);
    console.log("[Console] Deleting Plugin " + split[2]);
    
    setTimeout(function() {
      console.log("[Console] Reloading plugins");
      gameServer.pluginLoader.load();
      
    }, 3000)
    } else {
      console.log("[Console] Please specify a plugin filename")
      
    }
  } else {
    console.log("[Console] Please specify a command. Available commands: list, reload, delete")
  }


};
