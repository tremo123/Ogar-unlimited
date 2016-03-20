'use strict';
const ConfigService = require('./ConfigService.js');
const Gamemode = require('../gamemodes');
const GeneratorService = require('./GeneratorService.js');


module.exports = class GameServer {
  constructor(consoleService){
    // fields
    this.lastNodeId = 1;
    this.lastPlayerId = 1;

    // services
    this.consoleService = consoleService;
    this.generatorService = new GeneratorService(this);
    this.configService = new ConfigService();

    // Config
    this.config = this.configService.getConfig();
    this.banned = this.configService.getBanned();
    this.opbyip = this.configService.getOpByIp();
    this.highscores = this.configService.getHighScores();
    this.randomNames = this.configService.getBotNames();
    this.skinshortcut = this.configService.getSkinShortCuts();
    this.skin = this.configService.getSkins();

    // Gamemodes
    this.gameMode = Gamemode.get(this.config.serverGamemode);

  }
  init() {

  }
  start(){

  }
  update(dt){

  }
  getNextNodeId() {
    // Resets integer
    if (this.lastNodeId > 2147483647) {
      this.lastNodeId = 1;
    }
    return this.lastNodeId++;
  };
  getNewPlayerID() {
    // Resets integer
    if (this.lastPlayerId > 2147483647) {
      this.lastPlayerId = 1;
    }
    return this.lastPlayerId++;
  };
  getMode() {
    return this.gameMode;
  };


};
