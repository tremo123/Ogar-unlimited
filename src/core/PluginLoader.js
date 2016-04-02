'use strict';
const fs = require("fs");
const ini = require('../modules/ini.js');
const glob = require('glob');

module.exports = class PluginLoader {
  constructor(gameServer) {
    this.plugins = [];
    this.gameServer = gameServer;
    this.pluginGamemodes = [];
    this.extraC = [];


  }

  getPlugin() {
    return this.plugins

  }

  getPGamemodes() {
    return this.pluginGamemodes;
  }

  getPC() {
    return this.extraC;
  }

  load() {
    if (this.gameServer.config.dev == 1) {
      console.log("[Console] Loading plugins in dev mode");
      var files = fs.readdirSync('./plugins/');
      for (var i in files) {

        var plugin = require('../plugins/' + files[i] + '/index.js');
        if (plugin.name && plugin.author && plugin.version && plugin.init) {
          this.plugins[plugin.name] = plugin;
          plugin.init(this.gameServer);
          if (this.plugins) {
            if (plugin.commandName) {
              for (var j in plugin.commandName) {
                if (plugin.commandName[j] && plugin.command[j]) {
                  this.extraC[plugin.commandName[j]] = plugin.command[j];
                }
              }
              for (var j in plugin.gamemodeId) {
                if (plugin.gamemodeId[j] && plugin.gamemode[j]) {
                  this.pluginGamemodes[plugin.gamemodeId[j]] = plugin.gamemode[j];
                }
              }

            }


          }

          console.log("[Console] loaded plugin: " + plugin.name + " By " + plugin.author + " version " + plugin.version);

        } else {
          console.log("[Console] Didnt load pluginfile " + files[i] + " because it was missing parameters");
        }
      }

    } else {


      try {
        console.log("[Console] Loading plugins");
        var files = fs.readdirSync('./plugins/');
        for (var i in files) {

          try {
            var plugin = require('../plugins/' + files[i] + '/index.js');
            if (plugin.name && plugin.author && plugin.version && plugin.init) {
              this.plugins[files[i]] = plugin;
              plugin.init(this.gameServer);
              if (this.plugins) {
                if (plugin.commandName) {
                  for (var j in plugin.commandName) {
                    if (plugin.commandName[j] && plugin.command[j]) {
                      this.extraC[plugin.commandName[j]] = plugin.command[j];
                    }
                  }
                  for (var j in plugin.gamemodeId) {
                    if (plugin.gamemodeId[j] && plugin.gamemode[j]) {
                      this.pluginGamemodes[plugin.gamemodeId[j]] = plugin.gamemode[j];
                    }
                  }

                }

              }

              console.log("[Console] loaded plugin: " + plugin.name + " By " + plugin.author + " version " + plugin.version);
            } else {
              console.log("[Console] Didnt load pluginfile " + files[i] + " because it was missing parameters");
            }
          } catch (e) {
            console.log("[Console] Failed to load pluginfile " + files[i] + " Reason: " + e);

          }
        }
      } catch (e) {
        console.log("[Console] Couldnt load plugins");
      }
    }


  }
}
