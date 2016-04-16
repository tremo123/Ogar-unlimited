'use strict';
const WorldModel = require('./WorldModel.js');
const DataBaseConnector = require('./DataBaseConnector.js');

module.exports = class WorldDAO {
  constructor() {
    this.world = new WorldModel();
    this.dataBase = new DataBaseConnector('world');

    this.listeners = {
      gameMode: [],
      nodes: [],
      clients: []
    };

    this.dataBase.onChange((data)=>{
      this.onDbChange(data);
    });

  }

  onDbChange(data){
    if (data.doc._id === 'gameMode') {
      this.world.changeGameMode(data.doc.data);
      return;
    }

    if (data.doc._id.contains('node')) {
      let id = parseInt(data.doc._id.slice(4), 10);
      // todo do something
      return;
    }

    if (data.doc._id.contains('client')) {
      let id = parseInt(data.doc._id.slice(6), 10);
      // todo do something
      return;
    }

    console.error('[WorldDAO.onDbChange] Unknown data type for: ' + data.doc.id + ' data: ' + data.doc.data);

  }

  // todo need to rethink this for world model
  registerListner(what, func){
    this.listeners[what].push(func);
    return this[what];
  }

  getGameMode() {
    return this.world.getGameMode();
  }

  changeGameMode(gameMode) {
    this.world.changeGameMode(gameMode);
    this.dataBase.update({_id: 'gameMode', data: gameMode})
  }


};
