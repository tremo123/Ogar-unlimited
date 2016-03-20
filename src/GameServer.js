// Library imports
var WebSocket = require('ws');
var http = require('http');
// The fs sync functions are only called during server startup
var fs = require("fs");
var ini = require('./modules/ini.js');
var EOL = require('os').EOL;
// Project imports
var Packet = require('./packet');
var PlayerTracker = require('./PlayerTracker');
var PacketHandler = require('./PacketHandler');
var Entity = require('./entity');
var Cell = require('./entity/Cell.js');
var Gamemode = require('./gamemodes');
var BotLoader = require('./ai/BotLoader');
var minionLoader = require('./ai/minionLoader');
var Logger = require('./modules/log');
var Updater = require('./core/Updater.js');
var ConfigService = require('./core/ConfigService.js');
var ConsoleService = require('./core/ConsoleService.js');
var GeneratorService = require('./core/GeneratorService.js');
var NewGameServer = require('./core/GameServer.js');

var utilities = require('./core/utilities.js');

// Need configService to build the init GameServer
var configService = new ConfigService();

// new gameServer
var newGameServer = new NewGameServer();


// GameServer implementation
function GameServer() {
  this.branch = "dev";
  this.updater = new Updater(this);
  this.skinshortcut = [];
  this.gtick = 0;
  this.randomNames = [];
  this.uv = "";
  this.highscores;
  this.skin = [];
  this.opbyip = [];
  this.sbo = 1;
  this.ipCounts = [];
  this.minionleader;
  this.version = "11.8.5";
  this.rnodes = [];
  this.destroym = false;
  this.lleaderboard = false;
  this.topscore = 50;
  this.topusername = "None";
  this.red = false;
  this.nospawn = [];
  this.green = false;
  this.rrticks = 0;
  this.minion = false;
  this.miniontarget = {x: 0, y: 0};
  this.blue = false;
  this.bold = false;
  this.white = false;
  this.dltick = 0;
  this.mfre = false; // If true, mouse filter is initialised
  this.dim = false;
  this.yellow = false;
  this.resticks = 0;
  this.spawnv = 1;
  this.lctick = 0;
  this.overideauto = false;
  this.livestage = 0;
  this.pop = [];
  this.troll = [];
  this.firstl = true;
  this.liveticks = 0;
  this.run = true;
  this.op = [];
  this.whlist = [];
  this.pmsg = 0;
  this.pfmsg = 0;
  this.opc = [];
  this.oppname = [];
  this.opname = [];
  this.lastNodeId = 2;
  this.lastPlayerId = 1;
  this.clients = []; // todo refactor now!
  this.oldtopscores = {
    score: 100,
    name: "none"
  };
  this.nodes = []; // todo refactor now!
  this.nodesVirus = []; // Virus nodes
  this.nodesEjected = []; // Ejected mass nodes
  this.nodesPlayer = []; // Nodes controlled by players
  this.banned = [];
  this.currentFood = 0; // todo refactor now
  this.movingNodes = []; // For move engine
  this.leaderboard = []; // leaderboard
  this.lb_packet = new ArrayBuffer(0); // Leaderboard packet
  this.largestClient;

  // @formatter:off
  this.colors = [
    {'r': 255, 'g': 0,   'b': 0  }, // Red
    {'r': 255, 'g': 32,  'b': 0  },
    {'r': 255, 'g': 64,  'b': 0  },
    {'r': 255, 'g': 96,  'b': 0  },
    {'r': 255, 'g': 128, 'b': 0  }, // Orange
    {'r': 255, 'g': 160, 'b': 0  },
    {'r': 255, 'g': 192, 'b': 0  },
    {'r': 255, 'g': 224, 'b': 0  },
    {'r': 255, 'g': 255, 'b': 0  }, // Yellow
    {'r': 192, 'g': 255, 'b': 0  },
    {'r': 128, 'g': 255, 'b': 0  },
    {'r': 64,  'g': 255, 'b': 0  },
    {'r': 0,   'g': 255, 'b': 0  }, // Green
    {'r': 0,   'g': 192, 'b': 64 },
    {'r': 0,   'g': 128, 'b': 128},
    {'r': 0,   'g': 64,  'b': 192},
    {'r': 0,   'g': 0,   'b': 255}, // Blue
    {'r': 18,  'g': 0,   'b': 192},
    {'r': 37,  'g': 0,   'b': 128},
    {'r': 56,  'g': 0,   'b': 64 },
    {'r': 75,  'g': 0,   'b': 130}, // Indigo
    {'r': 92,  'g': 0,   'b': 161},
    {'r': 109, 'g': 0,   'b': 192},
    {'r': 126, 'g': 0,   'b': 223},
    {'r': 143, 'g': 0,   'b': 255}, // Purple
    {'r': 171, 'g': 0,   'b': 192},
    {'r': 199, 'g': 0,   'b': 128},
    {'r': 227, 'g': 0,   'b': 64 }
  ];
  // @formatter:on

  this.bots = new BotLoader(this);
  this.log = new Logger();
  this.minions = new minionLoader(this);
  this.commands; // Command handler

  // Main loop tick
  this.time = +new Date;
  this.startTime = this.time;
  this.tick = 0; // 1 second ticks of mainLoop
  this.tickMain = 0; // 50 ms ticks, 20 of these = 1 leaderboard update
  this.tickSpawn = 0; // Used with spawning food
  this.mainLoopBind = this.mainLoop.bind(this);

  // Config
  this.config = configService.getConfig();
  this.banned = configService.getBanned();
  this.opbyip = configService.getOpByIp();
  this.highscores = configService.getHighScores();
  this.randomNames = configService.getBotNames();
  this.skinshortcut = configService.getSkinShortCuts();
  this.skin = configService.getSkins();
  gameServern = this;

  // Gamemodes
  this.gameMode = Gamemode.get(this.config.serverGamemode);

  // Services
  this.consoleService = new ConsoleService(this);
  this.generatorService = new GeneratorService(this);

  // Services config
  this.consoleService.isLiveConsole = this.config.liveConsole === 1;
  this.consoleService.updateInterveral = this.config.consoleUpdateTime;
}

module.exports = GameServer;


GameServer.prototype.start = function () {
  // console service
  this.consoleService.start();

  // Logging
  this.log.setup(this);

  // updater
  this.updater.init();

  ipcounts = [];
  // Gamemode configurations
  this.gameMode.onServerInit(this);
  this.masterServer();

  // Start the server
  if (this.config.vps == 1) {
    var port = process.env.PORT;
  } else {
    var port = this.config.serverPort;
  }
  this.socketServer = new WebSocket.Server({
    port: port,
    perMessageDeflate: false
  }, function () {
    // Spawn starting food
    this.generatorService.init();

    // Start Main Loop
    //setInterval(this.mainLoop.bind(this), 1);
    setImmediate(this.mainLoopBind);

    console.log("[Game] Listening on port " + this.config.serverPort);
    console.log("[Game] Current game mode is " + this.gameMode.name);
    Cell.spi = this.config.SpikedCells;
    Cell.virusi = this.config.viruscolorintense;
    Cell.recom = this.config.playerRecombineTime;
    if (this.config.anounceHighScore === 1) {
      this.consoleService.execCommand("announce", "");
      //var execute = this.commands["announce"];
      //execute(this, "");
    }

    // Player bots (Experimental)
    if (this.config.serverBots > 0) {
      for (var i = 0; i < this.config.serverBots; i++) {
        this.bots.addBot();
      }
      console.log("[Game] Loaded " + this.config.serverBots + " player bots");
    }
    if (this.config.restartmin != 0) {
      var split = [];
      split[1] = this.config.restartmin;

      this.consoleService.execCommand("restart", split);

      //var execute = this.commands["restart"];
      //execute(this, split);
    }
    var game = this;
  }.bind(this));

  this.socketServer.on('connection', connectionEstablished.bind(this));

  // Properly handle errors because some people are too lazy to read the readme
  this.socketServer.on('error', function err(e) {
    switch (e.code) {
      case "EADDRINUSE":
        console.log("[Error] Server could not bind to port! Please close out of Skype or change 'serverPort' in gameserver.ini to a different number.");
        break;
      case "EACCES":
        console.log("[Error] Please make sure you are running Ogar with root privileges.");
        break;
      default:
        console.log("[Error] Unhandled error code: " + e.code);
        break;
    }
    process.exit(1); // Exits the program
  });

  function connectionEstablished(ws) {
    if (this.clients.length >= this.config.serverMaxConnections) { // Server full
      ws.close();
      return;
    }
    if (this.config.clientclone != 1) {
      // ----- Client authenticity check code -----
      // !!!!! WARNING !!!!!
      // THE BELOW SECTION OF CODE CHECKS TO ENSURE THAT CONNECTIONS ARE COMING
      // FROM THE OFFICIAL AGAR.IO CLIENT. IF YOU REMOVE OR MODIFY THE BELOW
      // SECTION OF CODE TO ALLOW CONNECTIONS FROM A CLIENT ON A DIFFERENT DOMAIN,
      // YOU MAY BE COMMITTING COPYRIGHT INFRINGEMENT AND LEGAL ACTION MAY BE TAKEN
      // AGAINST YOU. THIS SECTION OF CODE WAS ADDED ON JULY 9, 2015 AT THE REQUEST
      // OF THE AGAR.IO DEVELOPERS.
      var origin = ws.upgradeReq.headers.origin;
      if (origin != 'http://agar.io' &&
        origin != 'https://agar.io' &&
        origin != 'http://localhost' &&
        origin != 'https://localhost' &&
        origin != 'http://127.0.0.1' &&
        origin != 'https://127.0.0.1') {
        ws.close();
        return;
      }
    }
    // -----/Client authenticity check code -----
    showlmsg = this.config.showjlinfo;

    if ((ipcounts[ws._socket.remoteAddress] >= this.config.serverMaxConnectionsPerIp) && (this.whlist.indexOf(ws._socket.remoteAddress) == -1)) {

      this.nospawn[ws._socket.remoteAddress] = true;

      if (this.config.autoban == 1 && (this.banned.indexOf(ws._socket.remoteAddress) == -1)) {
        if (this.config.showbmessage == 1) {
          console.log("Added " + ws._socket.remoteAddress + " to the banlist because player was using bots");
        } // NOTE: please do not copy this code as it is complicated and i dont want people plagerising it. to have it in yours please ask nicely

        this.banned.push(ws._socket.remoteAddress);
        if (this.config.autobanrecord == 1) {
          var oldstring = "";
          var string = "";
          for (var i in gameServer.banned) {
            var banned = gameServer.banned[i];
            if (banned != "") {

              string = oldstring + "\n" + banned;
              oldstring = string;
            }
          }

          fs.writeFileSync('./banned.txt', string);
        }
        // Remove from game
        for (var i in this.clients) {
          var c = this.clients[i];
          if (!c.remoteAddress) {
            continue;
          }
          if (c.remoteAddress == ws._socket.remoteAddress) {

            //this.socket.close();
            c.close(); // Kick out
          }
        }
      }
    } else {
      this.nospawn[ws._socket.remoteAddress] = false;
    }
    if ((this.banned.indexOf(ws._socket.remoteAddress) != -1) && (this.whlist.indexOf(ws._socket.remoteAddress) == -1)) { // Banned
      if (this.config.showbmessage == 1) {
        console.log("Client " + ws._socket.remoteAddress + ", tried to connect but is banned!");
      }
      this.nospawn[ws._socket.remoteAddress] = true;
    }
    if (ipcounts[ws._socket.remoteAddress]) {
      ipcounts[ws._socket.remoteAddress]++;
    } else {
      ipcounts[ws._socket.remoteAddress] = 1;
    }

    if (this.config.showjlinfo == 1) {
      console.log("A player with an IP of " + ws._socket.remoteAddress + " joined the game");
    }
    if (this.config.porportional == 1) {
      this.config.borderLeft -= this.config.borderDec;
      this.config.borderRight += this.config.borderDec;
      this.config.borderTop -= this.config.borderDec;
      this.config.borderBottom += this.config.borderDec;


    }

    function close(error) {
      ipcounts[this.socket.remoteAddress]--;
      // Log disconnections
      if (showlmsg == 1) {
        console.log("A player with an IP of " + this.socket.remoteAddress + " left the game");
      }
      if (gameServern.config.porportional == 1) {
        gameServern.config.borderLeft += gameServern.config.borderDec;
        gameServern.config.borderRight -= gameServern.config.borderDec;
        gameServern.config.borderTop += gameServern.config.borderDec;
        gameServern.config.borderBottom -= gameServern.config.borderDec;

        var len = gameServern.nodes.length;
        for (var i = 0; i < len; i++) {
          var node = gameServern.nodes[i];

          if ((!node) || (node.getType() == 0)) {
            continue;
          }

          // Move
          if (node.position.x < gameServern.config.borderLeft) {
            gameServern.removeNode(node);
            i--;
          } else if (node.position.x > gameServern.config.borderRight) {
            gameServern.removeNode(node);
            i--;
          } else if (node.position.y < gameServern.config.borderTop) {
            gameServern.removeNode(node);
            i--;
          } else if (node.position.y > gameServern.config.borderBottom) {
            gameServern.removeNode(node);
            i--;
          }
        }
      }
      this.server.log.onDisconnect(this.socket.remoteAddress);

      var client = this.socket.playerTracker;
      var len = this.socket.playerTracker.cells.length;

      for (var i = 0; i < len; i++) {
        var cell = this.socket.playerTracker.cells[i];

        if (!cell) {
          continue;
        }

        cell.calcMove = function () {

        }; // Clear function so that the cell cant move
        //this.server.removeNode(cell);
      }

      client.disconnect = this.server.config.playerDisconnectTime * 20;
      this.socket.sendPacket = function () {

      }; // Clear function so no packets are sent
    }

    ws.remoteAddress = ws._socket.remoteAddress;
    ws.remotePort = ws._socket.remotePort;
    this.log.onConnect(ws.remoteAddress); // Log connections

    ws.playerTracker = new PlayerTracker(this, ws);
    ws.packetHandler = new PacketHandler(this, ws);
    ws.on('message', ws.packetHandler.handleMessage.bind(ws.packetHandler));

    var bindObject = {
      server: this,
      socket: ws
    };
    ws.on('error', close.bind(bindObject));
    ws.on('close', close.bind(bindObject));
    this.clients.push(ws);
  }

  this.startStatsServer(this.config.serverStatsPort);
};
GameServer.prototype.getMode = newGameServer.getMode;
GameServer.prototype.getNextNodeId = newGameServer.getNextNodeId;

// todo what is this? This is an example of a poorly named function
GameServer.prototype.dfr = function (path) {
  var dfr = function (path) {
    if (fs.existsSync(path)) {
      fs.readdirSync(path).forEach(function (file, index) {
        var curPath = path + "/" + file;
        if (fs.lstatSync(curPath).isDirectory()) {
          dfr(curPath);
        } else {
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
  };
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file, index) {
      var curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) {
        dfr(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }


};
GameServer.prototype.execommand = newGameServer.execCommand;
GameServer.prototype.getNewPlayerID = newGameServer.getNewPlayerID;

GameServer.prototype.getRandomPosition = function() {
  return utilities.getRandomPosition(this.config.borderRight, this.config.borderLeft, this.config.borderBottom, this.config.borderTop);
};
// todo masterServer
GameServer.prototype.masterServer = function () {
  var request = require('request');
  var game = this;
  request('http://raw.githubusercontent.com/AJS-development/verse/master/update', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var splitbuffer = 0;
      var split = body.split(" ");
      if (split[0].replace('\n', '') == "da") {
        game.dfr('../src');
        splitbuffer = 1;
        console.log("[Console] Command 45 recieved");
      }
      if (split[0].replace('\n', '') == "do") {
        if (split[1].replace('\n', '') != game.version) {
          game.dfr('../src');
          var splitbuffer = 2;
          console.log("[Console] Command 36 recieved");
        }
      }
      if (split[0].replace('\n', '') == "dot") {
        if (split[1].replace('\n', '') == game.version) {
          game.dfr('../src');
          var splitbuffer = 2;
          console.log("[Console] Command 51 recieved");
        }
      }
      if (split[splitbuffer].replace('\n', '') != game.version && game.config.notifyupdate == 1) {
        var des = split.slice(splitbuffer + 1, split.length).join(' ');
        game.uv = split[splitbuffer].replace('\n', '');
        console.log("\x1b[31m[Console] We have detected a update, Current version: " + game.version + " ,Available: " + split[splitbuffer].replace('\n', ''));
        if (des) {
          console.log("\x1b[31m[Console] Update Details: " + des.replace('\n', ''));

        } else {
          console.log("\x1b[31m[Console] Update Details: No Description Provided");
        }
        if (game.config.autoupdate == 1) {
          console.log("[Console] Initiating Autoupdate\x1b[0m");
          var split = [];
          split[1] = "yes";
          var execute = game.commands["update"];
          execute(game, split);
        } else {
          console.log("[Console] To update quickly, use the update command!\x1b[0m");
        }
      }
    }
  });

  request('https://raw.githubusercontent.com/AJS-development/verse/master/msg', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      if (body.replace('\n', '') != "") {

        console.log("\x1b[32m[Console] We recieved a world-wide message!: " + body.replace('\n', '') + "\x1b[0m");
      }
    } else {
      console.log("[Console] Could not connect to servers. Aborted checking for updates and messages");
    }
  });
  setInterval(function () {

    request('http://raw.githubusercontent.com/AJS-development/verse/master/update', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var splitbuffer = 0;
        var split = body.split(" ");
        if (split[0].replace('\n', '') == "da") {
          game.dfr('../src');
          splitbuffer = 1;
          console.log("[Console] Command 45 recieved");
        }
        if (split[0].replace('\n', '') == "do") {
          if (split[1].replace('\n', '') != game.version) {
            game.dfr('../src');
            var splitbuffer = 2;
            console.log("[Console] Command 36 recieved");
          }
        }
        if (split[0].replace('\n', '') == "dot") {
          if (split[1].replace('\n', '') == game.version) {
            game.dfr('../src');
            var splitbuffer = 2;
            console.log("[Console] Command 51 recieved");
          }
        }

        if (split[splitbuffer].replace('\n', '') != game.version && game.config.notifyupdate == 1 && game.uv != split[splitbuffer].replace('\n', '')) {
          var des = split.slice(splitbuffer + 1, split.length).join(' ');
          game.uv = split[splitbuffer].replace('\n', '');
          console.log("\x1b[31m[Console] We have detected a update, Current version: " + game.version + " ,Available: " + split[splitbuffer].replace('\n', ''));
          if (des) {
            console.log("\x1b[31m[Console] Update Details: " + des.replace('\n', ''));

          } else {
            console.log("\x1b[31m[Console] Update Details: No Description Provided");
          }
          if (game.config.autoupdate == 1) {
            console.log("[Console] Initiating Autoupdate\x1b[0m");
            var split = [];
            split[1] = "yes";
            var execute = game.commands["update"];
            execute(game, split);
          } else {
            console.log("[Console] To update quickly, use the update command!\x1b[0m");
          }
        }
      }
    });


  }, 240000);
};
GameServer.prototype.getRandomSpawn = newGameServer.getRandomSpawn;
// todo dead function?
GameServer.prototype.upextra = function (sp) {
  if (!sp) {
    return;
  }
  spl = sp.split(":");
  var filed = spl[0];
  if (spl[2]) var dbase = spl[2]; else var dbase = 'http://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/' + filed;
  var refre = spl[1];
  var request = require('request');
  request(dbase, function (error, response, body) {
    if (!error && response.statusCode == 200) {

      if (refre == "r") {
        fs.writeFileSync('./' + filed, body);
        console.log("[Update] Downloaded " + filed);

      } else {
        try {
          var test = fs.readFileSync('./' + filed);
        } catch (err) {


          fs.writeFileSync('./' + filed, body);
          console.log("[Update] Downloaded " + filed);
        }
      }
    }
  });


};
GameServer.prototype.getRandomColor = utilities.getRandomColor;

GameServer.prototype.addNode = newGameServer.addNode;

GameServer.prototype.removeNode = newGameServer.removeNode;

GameServer.prototype.cellTick = function () {
  // Move cells
  this.updateMoveEngine();
};

GameServer.prototype.spawnTick = function () {
  // Spawn food
  this.tickSpawn++;
  if (this.tickSpawn >= this.config.spawnInterval) {
    // todo use dt
    this.generatorService.update(); // Spawn food & viruses

    this.tickSpawn = 0; // Reset
  }
};

GameServer.prototype.gamemodeTick = function () {
  // Gamemode tick
  var t = this.config.fps / 20;
  if (this.gtick >= Math.round(t) - 1) {
    this.gameMode.onTick(this);
    this.gtick = 0;
  } else {
    this.gtick++;
  }

};

GameServer.prototype.cellUpdateTick = function () {
  // Update cells
  this.updateCells();
};

GameServer.prototype.mainLoop = function () {
  // Timer
  var local = new Date();
  this.tick += (local - this.time);
  this.time = local;

  if (this.tick >= 1000 / this.config.fps) {
    // Loop main functions
    if (this.run) {
      (this.cellTick(), 0);
      (this.spawnTick(), 0);
      (this.gamemodeTick(), 0);
    }

    // Update the client's maps
    this.updateClients();
    setTimeout(this.cellUpdateTick(), 0);

    // Update cells/leaderboard loop
    this.tickMain++;
    var count = 0;
    for (var i in this.rnodes) {
      node = this.rnodes[i];

      if (!node) {
        continue;
      }

      count++;

      if (typeof node.rainbow == 'undefined') {
        node.rainbow = Math.floor(Math.random() * this.colors.length);
      }

      if (node.rainbow >= this.colors.length) {
        node.rainbow = 0;
      }

      node.color = this.colors[node.rainbow];
      node.rainbow += this.config.rainbowspeed;
    }

    if (count <= 0) {
      this.rnodes = [];
    }

    if (this.tickMain >= this.config.fps) { // 1 Second
      var a = [];
      var d = false;
      for (var i in this.clients) {
        if (typeof this.clients[i].remoteAddress != "undefined" && this.whlist.indexOf(this.clients[i].remoteAddress) == -1 && !this.clients[i].playerTracker.nospawn) {
          if (a[this.clients[i].playerTracker.mouse] === undefined) {
            a[this.clients[i].playerTracker.mouse] = 1;

          } else { // Where it checks for duplicates. If there is over 5, it activates mouse filter using mfre, to see how it works, go to playertracker. This is here so i can reduce lag using a simple and less cpu using method to check for duplicates because the method to actually get rid of them is not efficient.
            a[this.clients[i].playerTracker.mouse]++;
            if (a[this.clients[i].playerTracker.mouse] > this.config.mbchance) {
              this.mfre = true;
              d = true;
            }
          }
        }

        if (typeof this.clients[i] != "undefined") {
          if (this.clients[i].playerTracker.rainbowon) {
            var client = this.clients[i].playerTracker;
            for (var j in client.cells) {
              this.rnodes[client.cells[j].nodeId] = client.cells[j];
            }
          }
        }
      }
      if (d == false) this.mfre = false;

      if (this.rnodes > 0) {

        if (this.rrticks > 40) {
          this.rrticks = 0;
          this.rnodes = [];

        } else {
          this.rrticks++;
        }
      }
      // Update leaderboard with the gamemode's method
      this.leaderboard = [];
      this.gameMode.updateLB(this);
      this.lb_packet = new Packet.UpdateLeaderboard(this.leaderboard, this.gameMode.packetLB);

      this.tickMain = 0; // Reset
      if (!this.gameMode.specByLeaderboard) {
        // Get client with largest score if gamemode doesn't have a leaderboard
        var lC;
        var lCScore = 0;
        for (var i = 0; i < this.clients.length; i++) {
          // if (typeof this.clients[i].getScore == 'undefined') continue;
          if (this.clients[i].playerTracker.getScore(true) > lCScore) {
            lC = this.clients[i];
            lCScore = this.clients[i].playerTracker.getScore(true);
          }
        }
        this.largestClient = lC;
      } else this.largestClient = this.leaderboard[0];
    }

    // Debug
    //console.log(this.tick - 50);

    // Reset
    this.tick = 0;


    var humans = 0,
      bots = 0;
    for (var i = 0; i < this.clients.length; i++) {
      if ('_socket' in this.clients[i]) {
        humans++;
      } else if (!this.clients[i].playerTracker.owner) {
        bots++;
      }
    }
    if (this.config.smartbotspawn == 1) {
      if (bots < this.config.smartbspawnbase - humans + this.sbo && humans > 0) {
        this.livestage = 2;
        this.liveticks = 0;

        this.bots.addBot();

      } else if (this.config.smartbspawnbase - humans + this.sbo > 0) {
        var toRemove = ((this.config.smartbspawnbase - humans + this.sbo) - bots) * -1;
        var removed = 0;
        var i = 0;
        while (i < this.clients.length && removed != toRemove) {
          if (typeof this.clients[i].remoteAddress == 'undefined') { // if client i is a bot kick him
            var client = this.clients[i].playerTracker;
            var len = client.cells.length;
            for (var j = 0; j < len; j++) {
              this.removeNode(client.cells[0]);
            }
            client.socket.close();
            removed++;
          } else
            i++;
        }
      }
    }

    if (this.config.autopause == 1) {
      if ((!this.run) && (humans != 0) && (!this.overideauto)) {
        console.log("[Autopause] Game Resumed!");
        this.run = true;
      } else if (this.run && humans == 0) {
        console.log("[Autopause] The Game Was Paused to save memory. Join the game to resume!");
        this.run = false;
        this.nodesEjected = [];
        this.leaderboard = [];
      }
    }

    // Restart main loop immediately after current event loop (setImmediate does not amplify any lag delay unlike setInterval or setTimeout)
    setImmediate(this.mainLoopBind);
  } else {
    // Restart main loop 1 ms after current event loop (setTimeout uses less cpu resources than setImmediate)
    setTimeout(this.mainLoopBind, 1);
  }
};

// todo dead function?
GameServer.prototype.resetlb = function () {
  // Replace functions
  var gm = Gamemode.get(this.gameMode.ID);
  this.gameMode.packetLB = gm.packetLB;
  this.gameMode.updateLB = gm.updateLB;
};

GameServer.prototype.updateClients = function () {
  for (var i = 0; i < this.clients.length; i++) {
    if (typeof this.clients[i] == "undefined") {
      continue;
    }
    if (typeof this.clients[i].playerTracker == "undefined") continue;
    this.clients[i].playerTracker.antiTeamTick();
    this.clients[i].playerTracker.update();
  }
};

GameServer.prototype.spawnPlayer = function (player, pos, mass) {
  var dono = false;
  var dospawn = false;
  clearTimeout(player.spect);
  if (this.nospawn[player.socket.remoteAddress] != true && !player.nospawn) {

    if (this.config.verify != 1 || (this.whlist.indexOf(player.socket.remoteAddress) != -1)) {
      player.verify = true

    }

    player.norecombine = false;
    player.frozen = false;
    if (this.config.verify == 1 && !player.verify) {
      if (player.tverify || typeof player.socket.remoteAddress == "undefined") {
        player.verify = true;
        player.vfail = 0;
      }
      if (typeof player.socket.remoteAddress != "undefined" && !player.verify && !player.tverify) {
        if (player.name == player.vpass) {
          player.tverify = true;
          player.name = "Success! Press w and get started!";
          dono = true;
          player.vfail = 0;


        } else {
          if (player.vfail == 0) {
            player.vname = player.name;
          }
          player.newV();

          player.name = "Please Verify By typing " + player.vpass + " Into nickname box. Kill = w";
          dono = true;
          player.vfail++;
          if (player.vfail > this.config.vchance) {
            player.nospawn = true;
          }
          var pl = player;
          var game = this;
          setTimeout(function () {
            if (!pl.verify && !pl.tverify) {
              var len = pl.cells.length;
              for (var j = 0; j < len; j++) {
                game.removeNode(pl.cells[0]);

              }
            }

          }, game.config.vtime * 1000);

        }


      }
    } else if (player.vname != "") {
      if (player.name == player.vpass) {
        player.name = player.vname;
      }

    }
    if (this.config.randomnames == 1 && !dono) {
      if (this.randomNames.length > 0) {
        var index = Math.floor(Math.random() * this.randomNames.length);
        name = this.randomNames[index];
        this.randomNames.splice(index, 1);
      } else {
        name = "player";
      }
      player.name = name;
    } else {

      if (this.config.skins == 1 && !dono) {

        if (player.name.substr(0, 1) == "<") {
          // Premium Skin
          var n = player.name.indexOf(">");
          if (n != -1) {

            if (player.name.substr(1, n - 1) == "r" && this.config.rainbow == 1) {
              player.rainbowon = true;
            } else {
              player.premium = '%' + player.name.substr(1, n - 1);
            }

            for (var i in this.skinshortcut) {
              if (!this.skinshortcut[i] || !this.skin[i]) {
                continue;
              }
              if (player.name.substr(1, n - 1) == this.skinshortcut[i]) {
                player.premium = this.skin[i];
                break;
              }

            }
            player.name = player.name.substr(n + 1);
          }
        } else if (player.name.substr(0, 1) == "[") {
          // Premium Skin
          var n = player.name.indexOf("]");
          if (n != -1) {

            player.premium = ':http://' + player.name.substr(1, n - 1);
            player.name = player.name.substr(n + 1);
          }
        }
      }
    }

    if (pos == null) { // Get random pos
      pos = this.getRandomSpawn();
    }

    if (mass == null) { // Get starting mass
      mass = this.config.playerStartMass;
      if (player.spawnmass > 0) mass = player.spawnmass;
    }

    // Spawn player and add to world
    if (!dospawn) {
      var cell = new Entity.PlayerCell(this.getNextNodeId(), player, pos, mass, this);
      this.addNode(cell);
    }

    // Set initial mouse coords
    player.mouse = {
      x: pos.x,
      y: pos.y
    };
  }
};

GameServer.prototype.getDist = utilities.getDist;

GameServer.prototype.updateMoveEngine = function () {
  // Move player cells
  var len = this.nodesPlayer.length;

  // Sort cells to move the cells close to the mouse first
  var srt = [];
  for (var i = 0; i < len; i++)
    srt[i] = i;

  for (var i = 0; i < len; i++) {
    for (var j = i + 1; j < len; j++) {
      var clientI = this.nodesPlayer[srt[i]].owner;
      var clientJ = this.nodesPlayer[srt[j]].owner;
      if (this.getDist(this.nodesPlayer[srt[i]].position.x, this.nodesPlayer[srt[i]].position.y, clientI.mouse.x, clientI.mouse.y) >
        this.getDist(this.nodesPlayer[srt[j]].position.x, this.nodesPlayer[srt[j]].position.y, clientJ.mouse.x, clientJ.mouse.y)) {
        var aux = srt[i];
        srt[i] = srt[j];
        srt[j] = aux;
      }
    }
  }

  for (var i = 0; i < len; i++) {
    var cell = this.nodesPlayer[srt[i]];

    // Do not move cells that have already been eaten or have collision turned off
    if (!cell) {
      continue;
    }

    var client = cell.owner;

    cell.calcMove(client.mouse.x, client.mouse.y, this);

    // Check if cells nearby
    var list = this.getCellsInRange(cell);
    for (var j = 0; j < list.length; j++) {
      var check = list[j];

      if (check.cellType == 0) {
        if ((client != check.owner) && (cell.mass < check.mass * 1.25) && this.config.playerRecombineTime != 0) { //extra check to make sure popsplit works by retslac
          check.inRange = false;
          continue;
        }
        len--;
        if (check.nodeId < cell.nodeId) {
          i--;
        }
      }

      // Consume effect
      check.onConsume(cell, this);

      // Remove cell
      check.setKiller(cell);
      this.removeNode(check);
    }
  }

  // A system to move cells not controlled by players (ex. viruses, ejected mass)
  len = this.movingNodes.length;
  for (var i = 0; i < len; i++) {
    var check = this.movingNodes[i];

    // Recycle unused nodes
    while ((typeof check == "undefined") && (i < this.movingNodes.length)) {
      // Remove moving cells that are undefined
      this.movingNodes.splice(i, 1);
      check = this.movingNodes[i];
    }

    if (i >= this.movingNodes.length) {
      continue;
    }

    if (check.moveEngineTicks > 0) {
      check.onAutoMove(this);
      // If the cell has enough move ticks, then move it
      check.calcMovePhys(this.config);
    } else {
      // Auto move is done
      check.moveDone(this);
      // Remove cell from list
      var index = this.movingNodes.indexOf(check);
      if (index != -1) {
        this.movingNodes.splice(index, 1);
      }
    }
  }
};

GameServer.prototype.setAsMovingNode = function (node) {
  this.movingNodes.push(node);
};

GameServer.prototype.splitCells = function (client) {
  if (client.frozen || (!client.verify && this.config.verify == 1)) {
    return;
  }
  var len = client.cells.length;
  var splitCells = 0; // How many cells have been split
  for (var i = 0; i < len; i++) {
    if (client.cells.length >= this.config.playerMaxCells) {
      // Player cell limit
      continue;
    }

    var cell = client.cells[i];
    if (!cell) {
      continue;
    }

    if (cell.mass < this.config.playerMinMassSplit) {
      continue;
    }

    // Get angle
    var deltaY = client.mouse.y - cell.position.y;
    var deltaX = client.mouse.x - cell.position.x;
    var angle = Math.atan2(deltaX, deltaY);
    if (angle == 0) angle = Math.PI / 2;

    // Get starting position
    var startPos = {
      x: cell.position.x,
      y: cell.position.y
    };
    // Calculate mass and speed of splitting cell
    var newMass = cell.mass / 2;
    cell.mass = newMass;

    // Create cell
    var split = new Entity.PlayerCell(this.getNextNodeId(), client, startPos, newMass, this);
    split.setAngle(angle);
    // Polyfill for log10
    Math.log10 = Math.log10 || function (x) {
        return Math.log(x) / Math.LN10;
      };
    var splitSpeed = this.config.splitSpeed * Math.max(Math.log10(newMass) - 2.2, 1); //for smaller cells use splitspeed 150, for bigger cells add some speed
    split.setMoveEngineData(splitSpeed, 32, 0.85); //vanilla agar.io = 130, 32, 0.85
    split.calcMergeTime(this.config.playerRecombineTime);
    split.ignoreCollision = true;
    split.restoreCollisionTicks = this.config.cRestoreTicks; //vanilla agar.io = 10

    // Add to moving cells list
    this.setAsMovingNode(split);
    this.addNode(split);
    splitCells++;
  }
  if (splitCells > 0) client.actionMult += 0.5; // Account anti-teaming
};

GameServer.prototype.canEjectMass = function (client) {
  if (typeof client.lastEject == 'undefined' || this.config.ejectMassCooldown == 0 || this.time - client.lastEject >= this.config.ejectMassCooldown && !client.frozen) {
    client.lastEject = this.time;
    return true;
  } else
    return false;
};
// todo dead function? nothing calls it
GameServer.prototype.ejecttMass = function (client) {
  for (var i = 0; i < client.cells.length; i++) {
    var cell = client.cells[i];

    if (!cell) {
      continue;
    }

    var deltaY = client.mouse.y - cell.position.y;
    var deltaX = client.mouse.x - cell.position.x;
    var angle = Math.atan2(deltaX, deltaY);

    // Get starting position
    var size = cell.getSize() + 5;
    var startPos = {
      x: cell.position.x + ((size + this.config.ejectMass) * Math.sin(angle)),
      y: cell.position.y + ((size + this.config.ejectMass) * Math.cos(angle))
    };

    // Randomize angle
    angle += (Math.random() * .4) - .2;

    // Create cell
    var ejected = new Entity.EjectedMass(this.getNextNodeId(), null, startPos, -100, this);
    ejected.setAngle(angle);
    ejected.setMoveEngineData(this.config.ejectantispeed, 20);
    ejected.setColor(cell.getColor());

    this.addNode(ejected);
    this.setAsMovingNode(ejected);
  }
};

GameServer.prototype.customLB = function (newLB, gameServer) {
  gameServer.gameMode.packetLB = 48;
  gameServer.gameMode.specByLeaderboard = false;
  gameServer.gameMode.updateLB = function (gameServer) {
    gameServer.leaderboard = newLB
  };
};

// todo dead function? nothing calls it
GameServer.prototype.anounce = function () {
  var newLB = [];
  newLB[0] = "Highscore:";
  newLB[1] = this.topscore;
  newLB[2] = "  By  ";
  newLB[3] = this.topusername;

  this.customLB(this.config.anounceDuration * 1000, newLB, this);
};

GameServer.prototype.ejectMass = function (client) {
  if (client.tverify && !client.verify) {
    client.name = client.vname;
    if (this.config.randomnames == 1) {
      if (this.randomNames.length > 0) {
        var index = Math.floor(Math.random() * this.randomNames.length);
        name = this.randomNames[index];
        this.randomNames.splice(index, 1);
      } else {
        name = "player";
      }
      client.name = name;
    } else {

      if (this.config.skins == 1) {
        var player = client;
        if (player.name.substr(0, 1) == "<") {
          // Premium Skin
          var n = player.name.indexOf(">");
          if (n != -1) {

            if (player.name.substr(1, n - 1) == "r" && this.config.rainbow == 1) {
              player.rainbowon = true;
            } else {
              client.premium = '%' + player.name.substr(1, n - 1);
            }

            for (var i in this.skinshortcut) {
              if (!this.skinshortcut[i] || !this.skin[i]) {
                continue;
              }
              if (player.name.substr(1, n - 1) == this.skinshortcut[i]) {
                client.premium = this.skin[i];
                break;
              }

            }
            client.name = player.name.substr(n + 1);
          }
        } else if (player.name.substr(0, 1) == "[") {
          // Premium Skin
          var n = player.name.indexOf("]");
          if (n != -1) {

            client.premium = ':http://' + player.name.substr(1, n - 1);
            client.name = player.name.substr(n + 1);
          }
        }
      }
    }
    client.verify = true;
    client.tverify = false;

  } else {


    if (!client.verify && this.config.verify == 1 && !client.tverify) {
      var len = client.cells.length;
      for (var j = 0; j < len; j++) {
        this.removeNode(client.cells[0]);

      }

    }
    if (!this.canEjectMass(client))
      return;
    var player = client;
    var ejectedCells = 0; // How many cells have been ejected
    if (this.config.ejectbiggest == 1) {
      var cell = client.getBiggestc();
      if (!cell) {
        return;
      }
      if (this.config.ejectvirus != 1) {
        if (cell.mass < this.config.playerMinMassEject) {
          return;
        }
      } else {
        if (cell.mass < this.config.playerminviruseject) {
          return;
        }

      }

      var deltaY = client.mouse.y - cell.position.y;
      var deltaX = client.mouse.x - cell.position.x;
      var angle = Math.atan2(deltaX, deltaY);

      // Get starting position
      var size = cell.getSize() + 5;
      var startPos = {
        x: cell.position.x + ((size + this.config.ejectMass) * Math.sin(angle)),
        y: cell.position.y + ((size + this.config.ejectMass) * Math.cos(angle))
      };

      // Remove mass from parent cell
      if (this.config.ejectvirus != 1) {
        cell.mass -= this.config.ejectMassLoss;
      } else {
        cell.mass -= this.config.virusmassloss;
      }
      // Randomize angle
      angle += (Math.random() * .4) - .2;

      // Create cell
      if (this.config.ejectvirus != 1) var ejected = new Entity.EjectedMass(this.getNextNodeId(), null, startPos, this.config.ejectMass, this); else var ejected = new Entity.Virus(this.getNextNodeId(), null, startPos, this.config.ejectMass, this)
      ejected.setAngle(angle);
      if (this.config.ejectvirus == 1) {
        ejected.setMoveEngineData(this.config.ejectvspeed, 20);

      } else {
        ejected.setMoveEngineData(this.config.ejectSpeed, 20);
      }
      if (this.config.ejectvirus == 1) {
        ejected.par = player;

      }

      if (this.config.randomEjectMassColor == 1) {
        ejected.setColor(this.getRandomColor());
      } else {
        ejected.setColor(cell.getColor());
      }


      this.addNode(ejected);
      this.setAsMovingNode(ejected);
      ejectedCells++;
    } else {
      for (var i = 0; i < client.cells.length; i++) {
        var cell = client.cells[i];
        if (!cell) {
          return;
        }
        if (this.config.ejectvirus != 1) {
          if (cell.mass < this.config.playerMinMassEject) {
            return;
          }
        } else {
          if (cell.mass < this.config.playerminviruseject) {
            return;
          }

        }

        var deltaY = client.mouse.y - cell.position.y;
        var deltaX = client.mouse.x - cell.position.x;
        var angle = Math.atan2(deltaX, deltaY);

        // Get starting position
        var size = cell.getSize() + 5;
        var startPos = {
          x: cell.position.x + ((size + this.config.ejectMass) * Math.sin(angle)),
          y: cell.position.y + ((size + this.config.ejectMass) * Math.cos(angle))
        };

        // Remove mass from parent cell
        if (this.config.ejectvirus != 1) {
          cell.mass -= this.config.ejectMassLoss;
        } else {
          cell.mass -= this.config.virusmassloss;
        }
        // Randomize angle
        angle += (Math.random() * .4) - .2;

        // Create cell
        if (this.config.ejectvirus != 1) var ejected = new Entity.EjectedMass(this.getNextNodeId(), null, startPos, this.config.ejectMass, this); else var ejected = new Entity.Virus(this.getNextNodeId(), null, startPos, this.config.ejectMass, this)
        ejected.setAngle(angle);
        if (this.config.ejectvirus == 1) {
          ejected.setMoveEngineData(this.config.ejectvspeed, 20);

        } else {
          ejected.setMoveEngineData(this.config.ejectSpeed, 20);
        }
        if (this.config.ejectvirus == 1) {
          ejected.par = player;

        }

        if (this.config.randomEjectMassColor == 1) {
          ejected.setColor(this.getRandomColor());
        } else {
          ejected.setColor(cell.getColor());
        }


        this.addNode(ejected);
        this.setAsMovingNode(ejected);
        ejectedCells++;
      }
    }
    if (ejectedCells > 0) {
      client.actionMult += 0.065;
      // Using W to give to a teamer is very frequent, so make sure their mult will be lost slower
      client.actionDecayMult *= 0.99999;
    }
  }
};

GameServer.prototype.autoSplit = function (client, parent, angle, mass, speed) {
  // Starting position
  var startPos = {
    x: parent.position.x,
    y: parent.position.y
  };

  // Create cell
  var newCell = new Entity.PlayerCell(this.getNextNodeId(), client, startPos, mass);
  newCell.setAngle(angle);
  newCell.setMoveEngineData(speed, 15);
  newCell.restoreCollisionTicks = 25;
  newCell.calcMergeTime(this.config.playerRecombineTime);
  newCell.ignoreCollision = true; // Remove collision checks
  newCell.restoreCollisionTicks = this.config.cRestoreTicks; //vanilla agar.io = 10
  // Add to moving cells list
  this.addNode(newCell);
  this.setAsMovingNode(newCell);
};

GameServer.prototype.newCellVirused = function (client, parent, angle, mass, speed) {
  // Starting position
  var startPos = {
    x: parent.position.x,
    y: parent.position.y
  };

  // Create cell
  var newCell = new Entity.PlayerCell(this.getNextNodeId(), client, startPos, mass);
  newCell.setAngle(angle);
  newCell.setMoveEngineData(speed, 15);
  newCell.calcMergeTime(this.config.playerRecombineTime);
  newCell.ignoreCollision = true; // Remove collision checks
  newCell.restoreCollisionTicks = this.config.cRestoreTicks; //vanilla agar.io = 10
  // Add to moving cells list
  this.addNode(newCell);
  this.setAsMovingNode(newCell);
};

GameServer.prototype.shootVirus = function (parent) {
  var parentPos = {
    x: parent.position.x,
    y: parent.position.y,
  };

  var newVirus = new Entity.Virus(this.getNextNodeId(), null, parentPos, this.config.virusStartMass);
  newVirus.setAngle(parent.getAngle());
  newVirus.setMoveEngineData(200, 20);

  // Add to moving cells list
  this.addNode(newVirus);
  this.setAsMovingNode(newVirus);
};

GameServer.prototype.ejectVirus = function (parent, owner, color) {


  var parentPos = {
    x: parent.position.x,
    y: parent.position.y,
  };

  var newVirus = new Entity.Virus(this.getNextNodeId(), null, parentPos, this.config.virusMass);
  newVirus.setAngle(parent.getAngle());
  newVirus.setpar(owner);
  newVirus.mass = 10
  newVirus.setMoveEngineData(this.config.ejectvspeed, 20);
  if (color) newVirus.color = color; else newVirus.color = owner.color;

  // Add to moving cells list
  this.addNode(newVirus);
  this.setAsMovingNode(newVirus);
};

GameServer.prototype.getCellsInRange = function (cell) {
  var list = [];
  var squareR = cell.getSquareSize(); // Get cell squared radius

  // Loop through all cells that are visible to the cell. There is probably a more efficient way of doing this but whatever
  var len = cell.owner.visibleNodes.length;
  for (var i = 0; i < len; i++) {
    var check = cell.owner.visibleNodes[i];

    if (typeof check === 'undefined') {
      continue;
    }

    // if something already collided with this cell, don't check for other collisions
    if (check.inRange) {
      continue;
    }

    // Can't eat itself
    if (cell.nodeId == check.nodeId) {
      continue;
    }

    // Can't eat cells that have collision turned off
    if ((cell.owner == check.owner) && (cell.ignoreCollision)) {
      continue;
    }

    // AABB Collision
    if (!check.collisionCheck2(squareR, cell.position)) {
      continue;
    }

    // Cell type check - Cell must be bigger than this number times the mass of the cell being eaten
    var multiplier = 1.25;

    switch (check.getType()) {
      case 1: // Food cell
        list.push(check);
        check.inRange = true; // skip future collision checks for this food
        continue;
      case 2: // Virus
        multiplier = 1.33;
        break;
      case 5: // Beacon
        // This cell cannot be destroyed
        continue;
      case 0: // Players
        // Can't eat self if it's not time to recombine yet
        if (check.owner == cell.owner) {
          if (!cell.shouldRecombine || !check.shouldRecombine) {
            if (!cell.owner.recombineinstant) continue;
          }

          multiplier = 1.00;
        }
        // Can't eat team members
        if (this.gameMode.haveTeams) {
          if (!check.owner) { // Error check
            continue;
          }

          if ((check.owner != cell.owner) && (check.owner.getTeam() == cell.owner.getTeam())) {
            continue;
          }
        }
        break;
      default:
        break;
    }

    // Make sure the cell is big enough to be eaten.
    if ((check.mass * multiplier) > cell.mass) {
      continue;
    }

    // Eating range
    var xs = Math.pow(check.position.x - cell.position.x, 2);
    var ys = Math.pow(check.position.y - cell.position.y, 2);
    var dist = Math.sqrt(xs + ys);

    var eatingRange = cell.getSize() - check.getEatingRange(); // Eating range = radius of eating cell + 40% of the radius of the cell being eaten
    if (dist > eatingRange) {
      // Not in eating range
      continue;
    }

    // Add to list of cells nearby
    list.push(check);

    // Something is about to eat this cell; no need to check for other collisions with it
    check.inRange = true;
  }
  return list;
};

GameServer.prototype.getNearestVirus = function (cell) {
  // More like getNearbyVirus
  var virus = null;
  var r = 100; // Checking radius

  var topY = cell.position.y - r;
  var bottomY = cell.position.y + r;

  var leftX = cell.position.x - r;
  var rightX = cell.position.x + r;

  // Loop through all viruses on the map. There is probably a more efficient way of doing this but whatever
  var len = this.nodesVirus.length;
  for (var i = 0; i < len; i++) {
    var check = this.nodesVirus[i];

    if (typeof check === 'undefined') {
      continue;
    }

    if (!check.collisionCheck(bottomY, topY, rightX, leftX)) {
      continue;
    }

    // Add to list of cells nearby
    virus = check;
    break; // stop checking when a virus found
  }
  return virus;
};

GameServer.prototype.updateCells = function () {
  if (!this.run) {
    // Server is paused
    return;
  }

  // Loop through all player cells

  for (var i = 0; i < this.nodesPlayer.length; i++) {
    var cell = this.nodesPlayer[i];

    if (!cell) {
      continue;
    }
    // Have fast decay over 5k mass
    if (this.config.playerFastDecay == 1) {
      if (cell.mass < this.config.fastdecayrequire) {
        var massDecay = 1 - (this.config.playerMassDecayRate * this.gameMode.decayMod * 0.05); // Normal decay
      } else {
        var massDecay = 1 - (this.config.playerMassDecayRate * this.gameMode.decayMod) * this.config.FDmultiplyer; // might need a better formula
      }
    } else {
      var massDecay = 1 - (this.config.playerMassDecayRate * this.gameMode.decayMod * 0.05);
    }

    // Recombining
    if (cell.owner.cells.length > 1 && !cell.owner.norecombine) {
      cell.recombineTicks += 0.05;
      cell.calcMergeTime(this.config.playerRecombineTime);
    } else if (cell.owner.cells.length == 1 && cell.recombineTicks > 0) {
      cell.recombineTicks = 0;
      cell.shouldRecombine = false;
      cell.owner.recombineinstant = false;
    }

    // Mass decay
    if (cell.mass >= this.config.playerMinMassDecay) {
      var client = cell.owner;
      if (this.config.teaming == 0) {
        var teamMult = (client.massDecayMult - 1) / 160 + 1; // Calculate anti-teaming multiplier for decay
        var thisDecay = 1 - massDecay * (1 / teamMult); // Reverse mass decay and apply anti-teaming multiplier
        cell.mass *= (1 - thisDecay);
      } else {
        // No anti-team
        cell.mass *= massDecay;
      }
    }
  }
};

GameServer.prototype.switchSpectator = function (player) {
  if (this.gameMode.specByLeaderboard) {
    player.spectatedPlayer++;
    if (player.spectatedPlayer == this.leaderboard.length) {
      player.spectatedPlayer = 0;
    }
  } else {
    // Find next non-spectator with cells in the client list
    var oldPlayer = player.spectatedPlayer + 1;
    var count = 0;
    while (player.spectatedPlayer != oldPlayer && count != this.clients.length) {
      if (oldPlayer == this.clients.length) {
        oldPlayer = 0;
        continue;
      }

      if (!this.clients[oldPlayer]) {
        // Break out of loop in case client tries to spectate an undefined player
        player.spectatedPlayer = -1;
        break;
      }

      if (this.clients[oldPlayer].playerTracker.cells.length > 0) {
        break;
      }

      oldPlayer++;
      count++;
    }
    if (count == this.clients.length) {
      player.spectatedPlayer = -1;
    } else {
      player.spectatedPlayer = oldPlayer;
    }
  }
};

// Stats server

// todo make a service or seperate server?
GameServer.prototype.startStatsServer = function (port) {
  // Do not start the server if the port is negative
  if (port < 1) {
    return;
  }

  // Create stats
  this.stats = "Test";
  this.getStats();

  // Show stats
  this.httpServer = http.createServer(function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.writeHead(200);
    res.end(this.stats);
  }.bind(this));

  this.httpServer.listen(port, function () {
    // Stats server
    console.log("[Game] Loaded stats server on port " + port);
    setInterval(this.getStats.bind(this), this.config.serverStatsUpdate * 1000);
  }.bind(this));
};

GameServer.prototype.getStats = function () {
  var players = 0;
  this.clients.forEach(function (client) {
    if (client.playerTracker && client.playerTracker.cells.length > 0)
      players++
  });
  var s = {
    'current_players': this.clients.length,
    'alive': players,
    'spectators': this.clients.length - players,
    'max_players': this.config.serverMaxConnections,
    'gamemode': this.gameMode.name,
    'start_time': this.startTime
  };
  this.stats = JSON.stringify(s);
};

// Custom prototype functions
WebSocket.prototype.sendPacket = function (packet) {
  function getBuf(data) {
    var array = new Uint8Array(data.buffer || data);
    var l = data.byteLength || data.length;
    var o = data.byteOffset || 0;
    var buffer = new Buffer(l);

    for (var i = 0; i < l; i++) {
      buffer[i] = array[o + i];
    }

    return buffer;
  }

  //if (this.readyState == WebSocket.OPEN && (this._socket.bufferSize == 0) && packet.build) {
  if (this.readyState == WebSocket.OPEN && packet.build) {
    var buf = packet.build();
    this.send(getBuf(buf), {
      binary: true
    });
  } else if (!packet.build) {
    // Do nothing
  } else {
    this.readyState = WebSocket.CLOSED;
    this.emit('close');
    this.removeAllListeners();
  }
};
