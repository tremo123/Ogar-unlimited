'use strict';
// This is the main server process that should only ever be called once. It creates and controls the other servers
// as well as controls the communication between them and shares data
const utilities = require('./utilities.js');
const BASE_DIR = utilities.getBaseDir(__dirname);

const WorldModel = require('./WorldModel');
const GameServer = require('./GameServer');
const ConsoleService = require('./ConsoleService.js');
const ConfigService = require('./ConfigService.js');
const Updater = require('./Updater.js');
const spawn = require('child_process').spawn;
//let updater = new Updater(this);

'use strict';
module.exports = class ControlServer {
  constructor(version) {
    // fields
    //this.consoleStreams = {};
    this.servers = [];
    this.version = version;

    // services
    this.consoleService = new ConsoleService(this.version);
    this.updater = new Updater(this);

  }

  /**
   * Inits the game server i.e. calls the updater and anything else that should run before we start the server.
   */
  init() {
    // Init updater
    this.updater.init();
  }

  /**
   * Starts the control server which will start and monitor other servers
   */
  start() {
    // start the in memory DataBase
    this.startDB();
  }

  startPhase2() {
    // share data
    this.configService = new ConfigService(); // we need the config service first so we can setup other services / servers
    this.config = this.configService.getConfig();
    this.world = new WorldModel(this.config, this.config.borderRight, this.config.borderLeft, this.config.borderBottom, this.config.borderTop);

    // servers
    this.gameServer = new GameServer(this.world, this.consoleService, this.configService , this.version);

    // configuration
    this.consoleService.setGameServer(this.gameServer);

    this.consoleService.start();

    // Add command handler
    // todo breaking encapsulation
    this.gameServer.commands = this.consoleService.commands.list;

    // Run Ogar
    this.gameServer.init();
    this.gameServer.start();
  }


  /**
   * Shuts down the server. Depending on the reason it will restart if needed.
   * @param reason - restart, shutdown, update
   */
  stop(reason) {
    // todo ControlServer stop
    // stop the in memory DataBase
    this.stopDB();
  }

  /**
   * Periodic control server task.
   */
  update() {

  }

  getWorld() {
    return this.world;
  }

  getConsoleService() {
    return this.consoleService;
  }

  startDB() {
    // start an in memory database
    let pouchDbServer = BASE_DIR + '/node_modules/pouchdb-server/bin/pouchdb-server';
    let dataBase = spawn('node', [pouchDbServer, '--port', '5984', '-m']);
    this.servers['dataBase'] = dataBase;
    let self = this;
    dataBase.stdout.on('data', function (data) {
      if (data.toString().match(/started/)) {
        console.log('db stdout: ' + data);
        // todo we can set this up better.
        self.startPhase2();
      }
    });
    dataBase.stderr.on('data', function (data) {
      console.log('db stdout: ' + data);
      //Here is where the error output goes
    });
    dataBase.on('close', function (code) {
      console.log('db closing code: ' + code);
      //Here you can get the exit code of the script
      //We could also restart the process here if needed
    });
  }
  stopDB() {
    // tell it to stop nicely
    this.servers['dataBase'].kill('SIGTERM');
  }

};

