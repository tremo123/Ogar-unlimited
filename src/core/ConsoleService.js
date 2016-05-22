'use strict';
const Commands = require('../modules/CommandList');
const EOL = require('os').EOL;

module.exports = class ConsoleService {
  constructor(version, ismaster, name,multiverse) {
    this.gameServer = undefined;
    this.version = version;
    this.updateInterveral = 100;
    this.multiverse = multiverse;
    this.name = name;
    this.isLiveConsole = false;
    this.interveral = undefined;
    this.hasTitleBeenWriten = false;
this.isMaster = ismaster;
    // commands
    this.commands = Commands.list;

  }
log(a) {
  if (this.isMaster) console.log(a)
  
}


  start() {
    
    this.log('[\x1b[34mINFO\x1b[0m] Starting ConsoleService');
    process.stdout.write("\u001b[2J\u001b[0;0H");
    if (this.gameServer === undefined) {
      throw "[\x1b[31mFAIL\x1b[0m] GameSever has not been set, cannot start!"
    }
    if (!this.hasTitleBeenWriten) {
      this.writeTitle();
      this.hasTitleBeenWriten = true;
    }
    this.interveral = setInterval(this.update.bind(this), this.updateInterveral);
  }

  stop() {
    if (this.interveral) {
      clearInterval(this.interveral);
    }

  }

  update() {
    if (this.isLiveConsole && this.isMaster) {
      this.liveConsole();
    }
  }

  // todo this needs a lot of work
  liveConsole() {
    if (this.gameServer.livestage == 0) {
      if (this.gameServer.liveticks > 80) {
        this.gameServer.livestage = 1;
        this.gameServer.firstl = true;
        this.gameServer.liveticks = 0;
      }
      var players = 0;
      this.gameServer.clients.forEach(function (client) {
        if (client.playerTracker && client.playerTracker.cells.length > 0)
          players++
      });
      var line1 = "               Status                            ";
      var line2 = "       Players:      " + this.gameServer.clients.length + "                           ";
      var line3 = "       Spectators:   " + (this.gameServer.clients.length - players) + "                            ";
      var line4 = "       Alive:        " + players + "                          ";
      var line5 = "       Max Players:  " + this.gameServer.config.serverMaxConnections + "                        ";
      var line6 = "       Start Time:   " + this.gameServer.startTime + "                ";
    } else if (this.gameServer.livestage == 1) {
      if (this.gameServer.liveticks > 80) {
        this.gameServer.liveticks = 0;
        this.gameServer.firstl = true;
        this.gameServer.livestage = 2;
      }
      var players = 0;
      this.gameServer.clients.forEach(function (client) {
        if (client.playerTracker && client.playerTracker.cells.length > 0)
          players++
      });
      if (!this.gameServer.gameMode.haveTeams && this.gameServer.lleaderboard) {
        if (this.gameServer.leaderboard.length <= 0) {
          var l1 = "No Players";
          var l2 = "Are Playing";
          var l3 = "";
          var l4 = "";
          var l5 = "";
        } else {
          if (typeof this.gameServer.leaderboard[0] != "undefined") {
            var l1 = this.gameServer.leaderboard[0].name;
          } else {
            var l1 = "None"
          }
          if (typeof this.gameServer.leaderboard[1] != "undefined") {
            var l2 = this.gameServer.leaderboard[1].name;
          } else {
            var l2 = "None"
          }
          if (typeof this.gameServer.leaderboard[2] != "undefined") {
            var l3 = this.gameServer.leaderboard[2].name;
          } else {
            var l3 = "None"
          }
          if (typeof this.gameServer.leaderboard[3] != "undefined") {
            var l4 = this.gameServer.leaderboard[3].name;
          } else {
            var l4 = "None"
          }
          if (typeof this.gameServer.leaderboard[4] != "undefined") {
            var l5 = this.gameServer.leaderboard[4].name;
          } else {
            var l5 = "None"
          }
        }
      } else {
        var l1 = "Sorry, No leader";
        var l2 = "Board in Teams!";
        var l3 = "Or in MSG Mode";
        var l4 = "";
        var l5 = "";
      }
      var line1 = "              Leaderboard                   ";
      var line2 = "               1." + l1 + "                    ";
      var line3 = "               2." + l2 + "                    ";
      var line4 = "               3." + l3 + "                    ";
      var line5 = "               4." + l4 + "                    ";
      var line6 = "               5." + l5 + "                    ";
    } else if (this.gameServer.livestage == 2) {
      if (this.gameServer.liveticks > 80) {
        this.gameServer.livestage = 0;
        this.gameServer.liveticks = 0;
        this.gameServer.firstl = true;
      }
      var line1 = "               Status                            ";
      var line2 = "       Uptime:      " + process.uptime() + "                    ";
      var line3 = "       Memory:      " + process.memoryUsage().heapUsed / 1000 + "/" + process.memoryUsage().heapTotal / 1000 + " kb";
      var line4 = "       Banned:      " + this.gameServer.banned.length + "        ";
      var line5 = "       Highscore:   " + this.gameServer.topscore + " By " + this.gameServer.topusername + "      ";
      var line6 = "                                                ";
    }
    if (this.gameServer.firstl) {
      process.stdout.write("\x1b[0m\u001B[s\u001B[H\u001B[6r");
      process.stdout.write("\u001B[8;36;44m   ___                                                                        " + EOL);
      process.stdout.write("  / _ \\ __ _ __ _ _ _                                                         " + EOL);
      process.stdout.write(" | (_) / _` / _` | '_|                                                        " + EOL);
      process.stdout.write("  \\___/\\__, \\__,_|_|                                                          " + EOL);
      process.stdout.write("\u001B[4m       |___/                                                                  " + EOL);
      process.stdout.write("   u n l i m i t e d                                                          " + EOL);
      process.stdout.write("\x1b[0m\u001B[0m\u001B[u");
      this.gameServer.firstl = false;
    }

    if (this.gameServer.resticks > 29) {
      this.gameServer.firstl = true;
      this.gameServer.resticks = 0;
    } else {
      this.gameServer.resticks++;
    }

    process.stdout.write("\x1b[0m\u001B[s\u001B[H\u001B[6r");
    process.stdout.write("\u001B[8;36;44m   ___                  " + line1 + EOL);
    process.stdout.write("  / _ \\ __ _ __ _ _ _   " + line2 + EOL);
    process.stdout.write(" | (_) / _` / _` | '_|  " + line3 + EOL);
    process.stdout.write("  \\___/\\__, \\__,_|_|    " + line4 + EOL);
    process.stdout.write("\u001B[4m       |___/            " + line5 + EOL);
    process.stdout.write("   u n l i m i t e d    " + line6 + EOL);
    process.stdout.write("\x1b[0m\u001B[0m\u001B[u");

   
    this.gameServer.liveticks++;
  }
  execCommand(command, split) {
    try {
      var execute = this.commands[command];
      if (typeof execute !== 'undefined') {
      execute(this.gameServer, split);
    } else {
      var execute = this.gameServer.pluginCommands[command];
      if (typeof execute !== 'undefined') {
        execute(this.gameServer, split);

      } else {
        console.warn('[\x1b[31mFAIL\x1b[0m] Failed to run command: ' + command + " args: " + split);
      }
    }
    } catch (e) {
      console.warn('[\x1b[31mFAIL\x1b[0m] Failed to run command: ' + command + " args: " + split);
    }

  };
execcommand(command, args) {
 return this.execCommand(command, args); 
}
execommand(command, args) {
 return this.execCommand(command, args); 
}
  setGameServer(gameServer) {
    this.gameServer = gameServer;
  }


  writeTitle() {
    // Start msg
    this.log("\u001B[33m                                        _ _       _              _ ");
    this.log("                                       | (_)     (_)_           | |");
    this.log("  ___   ____  ____  ____    _   _ ____ | |_ ____  _| |_  ____ _ | |");
    this.log(" / _ \\ / _  |/ _  |/ ___)  | | | |  _ \\| | |    \\| |  _)/ _  ) || |");
    this.log("| |_| ( ( | ( ( | | |      | |_| | | | | | | | | | | |_( (/ ( (_| |");
    this.log(" \\___/ \\_|| |\\_||_|_|       \\____|_| |_|_|_|_|_|_|_|\\___)____)____|");
    this.log("      (_____|                                                      \u001B[0m");

    this.log("\x1b[32m[Game] Ogar Unlimited - An open source Agar.io server implementation");
    this.log("[Game] By The AJS development team\x1b[0m");
    this.log("[Game] Server version is " + this.version);
  }

