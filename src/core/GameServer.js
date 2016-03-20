'use strict';
const ConfigService = require('./ConfigService.js');
let configService = new ConfigService();
const Gamemode = require('../gamemodes');


module.exports = class GameServer {
  constructor(){
    this.lastNodeId = 1;
    this.lastPlayerId = 1;



    // Config
    this.config = configService.getConfig();
    this.banned = configService.getBanned();
    this.opbyip = configService.getOpByIp();
    this.highscores = configService.getHighScores();
    this.randomNames = configService.getBotNames();
    this.skinshortcut = configService.getSkinShortCuts();
    this.skin = configService.getSkins();

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



};
