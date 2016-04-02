"use strict";
const PouchDB = require('pouchdb');

module.exports = class DataBaseConnector {
  constructor(dataBase, host, port) {
    if (dataBase === undefined) throw 'dataBase cannot be undefined!';
    host = (host) ? host : "localhost";
    port = (port) ? port : 5984;
    let uri = 'http://' + host + ':' + port + '/' + dataBase;
    this.db = new PouchDB(uri);
  }

  onChange(callBack){
    this.db.changes({
      live: true,
      include_docs: true
    }).on('change', callBack);
  }

  put(data){
    this.db.put(data)
    .catch((error)=>{
      console.log('[DataBaseConnector] error: ' + error + ' while attempting to put: ' + data);
    });
  }
};
