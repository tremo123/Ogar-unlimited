// This line is here to throw an error if anything tries to use this file

'use strict';
// Library imports
var WebSocket = require('ws');
var http = require('http');
// The fs sync functions are only called during server startup
var fs = require("fs");
//var ini = require('./modules/ini.js');
//var EOL = require('os').EOL;
// Project imports
var Packet = require('./packet');
//var PlayerTracker = require('./PlayerTracker');
//var PacketHandler = require('./PacketHandler');
//var Entity = require('./entity');
//var Cell = require('./entity/Cell.js');
//var Gamemode = require('./gamemodes');
var BotLoader = require('./ai/BotLoader');
var minionLoader = require('./ai/MinionLoader');
//var Logger = require('./modules/log');
//var Updater = require('./core/Updater.js');
var ConfigService = require('./core/ConfigService.js');
//var ConsoleService = require('./core/ConsoleService.js');
//var GeneratorService = require('./core/GeneratorService.js');
//var NewGameServer = require('./core/GameServer.js');
//var StatServer = require('./core/StatServer.js');

var utilities = require('./core/utilities.js');

// Need configService to build the init GameServer
var configService = new ConfigService();

// new gameServer
//var newGameServer = new NewGameServer();


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

  this.pmsg = 0;
  this.pfmsg = 0;
  this.opc = [];
  this.oppname = [];
  this.opname = [];

  this.oldtopscores = {
    score: 100,
    name: "none"
  };


  this.nodesVirus = []; // Virus nodes
  this.nodesEjected = []; // Ejected mass nodes

  this.banned = [];


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

  //this.bots = new BotLoader(this);
  ////this.log = new Logger();
  //this.minions = new minionLoader(this);
  //this.commands; // Command handler

  // Main loop tick
  //this.time = +new Date;
  //this.startTime = this.time;
  //this.tick = 0; // 1 second ticks of mainLoop
  //this.tickMain = 0; // 50 ms ticks, 20 of these = 1 leaderboard update
  //this.tickSpawn = 0; // Used with spawning food
  //this.mainLoopBind = this.mainLoop.bind(newGameServer);

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
  //this.gameMode = Gamemode.get(newGameServer.getConfig().serverGamemode);

  // Services
  //this.consoleService = new ConsoleService(this);
  //this.generatorService = new GeneratorService(newGameServer);
  //this.statServer = new StatServer(newGameServer, this.config.serverStatsPort, this.config.serverStatsUpdate);

  //// Services config
  //this.consoleService.isLiveConsole = this.config.liveConsole === 1;
  //this.consoleService.updateInterveral = this.config.consoleUpdateTime;

  // refactoring fields
  this.nospawn = [];
  //this.clients = newGameServer.clients;
  //this.nodes = newGameServer.nodes;
  //this.currentFood = newGameServer.currentFood;
  //this.movingNodes = newGameServer.movingNodes;
  //this.nodesPlayer = newGameServer.nodesPlayer;

}
GameServer.prototype.setConsoleService = function(consoleService){
  newGameServer.setConsoleService(consoleService);
};

module.exports = GameServer;

// start refactored functions
GameServer.prototype.getMode = newGameServer.getMode;
GameServer.prototype.getNextNodeId = newGameServer.getNextNodeId;
GameServer.prototype.execommand = newGameServer.execCommand;
GameServer.prototype.getNewPlayerID = newGameServer.getNewPlayerID;
GameServer.prototype.getRandomPosition = newGameServer.getRandomPosition;
GameServer.prototype.getRandomSpawn = newGameServer.getRandomSpawn;
GameServer.prototype.addNode = newGameServer.addNode;
GameServer.prototype.removeNode = newGameServer.removeNode;
GameServer.prototype.getRandomColor = newGameServer.getRandomColor;
GameServer.prototype.getDist = newGameServer.getDist;

GameServer.prototype.updateMoveEngine = newGameServer.updateMoveEngine.bind(newGameServer);
GameServer.prototype.updateCells = newGameServer.updateCells;
GameServer.prototype.setAsMovingNode = newGameServer.setAsMovingNode;
// end refactored functions

// start refactoring functions

// duplicated in core/GameServer.js

// end refactoring functions

// temp helper functions
GameServer.prototype.getNodesPlayer = newGameServer.getNodesPlayer;
GameServer.prototype.addNodesPlayer = newGameServer.getNodesPlayer;

// end temp helper functions

GameServer.prototype.start = newGameServer.start.bind(newGameServer);

// todo what is this? This is an example of a poorly named function
GameServer.prototype.dfr = newGameServer.dfr.bind(newGameServer);

// todo masterServer
GameServer.prototype.masterServer = newGameServer.masterServer.bind(newGameServer);

// todo dead function?
GameServer.prototype.upextra = newGameServer.upextra.bind(newGameServer);

GameServer.prototype.cellTick = newGameServer.cellTick.bind(newGameServer);

GameServer.prototype.spawnTick = newGameServer.spawnTick.bind(newGameServer);

GameServer.prototype.gamemodeTick = newGameServer.gameModeTick.bind(newGameServer);

GameServer.prototype.cellUpdateTick = newGameServer.cellUpdateTick.bind(newGameServer);

GameServer.prototype.mainLoop = newGameServer.mainLoop.bind(newGameServer);

// todo dead function?
GameServer.prototype.resetlb = newGameServer.resetlb.bind(newGameServer);

GameServer.prototype.updateClients = newGameServer.updateClients.bind(newGameServer);

GameServer.prototype.spawnPlayer = newGameServer.spawnPlayer.bind(newGameServer);

GameServer.prototype.splitCells = newGameServer.canEjectMass.bind(newGameServer);

GameServer.prototype.canEjectMass = newGameServer.canEjectMass.bind(newGameServer);
// todo dead function? nothing calls it
GameServer.prototype.ejecttMass = newGameServer.ejecttMass.bind(newGameServer);

GameServer.prototype.customLB = newGameServer.customLB.bind(newGameServer);

// todo dead function? nothing calls it
GameServer.prototype.anounce = newGameServer.anounce.bind(newGameServer);

GameServer.prototype.ejectMass = newGameServer.ejectMass.bind(newGameServer);

GameServer.prototype.autoSplit = newGameServer.autoSplit.bind(newGameServer);

GameServer.prototype.newCellVirused = newGameServer.newCellVirused.bind(newGameServer);

GameServer.prototype.shootVirus = newGameServer.shootVirus.bind(newGameServer);

GameServer.prototype.ejectVirus = newGameServer.ejectVirus.bind(newGameServer);

GameServer.prototype.getCellsInRange = newGameServer.getCellsInRange.bind(newGameServer);

GameServer.prototype.getNearestVirus = newGameServer.getNearestVirus.bind(newGameServer);


GameServer.prototype.switchSpectator = newGameServer.switchSpectator.bind(newGameServer);

// Custom prototype functions
//WebSocket.prototype.sendPacket = function (packet) {
//  function getBuf(data) {
//    var array = new Uint8Array(data.buffer || data);
//    var l = data.byteLength || data.length;
//    var o = data.byteOffset || 0;
//    var buffer = new Buffer(l);
//
//    for (var i = 0; i < l; i++) {
//      buffer[i] = array[o + i];
//    }
//
//    return buffer;
//  }
//
//  //if (this.readyState == WebSocket.OPEN && (this._socket.bufferSize == 0) && packet.build) {
//  if (this.readyState == WebSocket.OPEN && packet.build) {
//    var buf = packet.build();
//    this.send(getBuf(buf), {
//      binary: true
//    });
//  } else if (!packet.build) {
//    // Do nothing
//  } else {
//    this.readyState = WebSocket.CLOSED;
//    this.emit('close');
//    this.removeAllListeners();
//  }
//};
