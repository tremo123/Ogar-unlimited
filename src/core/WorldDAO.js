'use strict';
const WorldModel = require('./WorldModel.js');
const DataBaseConnector = require('./DataBaseConnector.js');

module.exports = class WorldDAO {
  constructor() {
    this.dataBase = new DataBaseConnector('world');

    this.dataBase.onChange((data)=>{
      this.onDbChange(data);
    });

  }

  onDbChange(data){
    this[data.doc._id] = data.doc.data;
    this.listeners[data.doc._id].forEach((func)=>{
      try {
        func(data.doc.data);
      } catch (error) {
        console.error('[WorldDAO.onDbChange] Failed to call listener for: ' + data.doc.id + ' error: ' + error);
      }

    })
  }

  // todo need to rethink this for world model
  registerListner(what, func){
    this.listeners[what].push(func);
    return this[what];
  }


};
