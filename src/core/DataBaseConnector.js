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

  onChange(callBack) {
    this.db.changes({
      live: true,
      include_docs: true
    }).on('change', callBack);
  }

  put(data) {
    this.db.put(data)
      .catch(this.handleError);
  }

  update(data) {
    let self = this;
    this.db.get(data._id).then((doc)=> {
      console.log('doc rev: ' + doc._rev)
      return self.db.put(data, 'data._id', doc._rev);
    }).catch(this.handleError);
  }

  get(what, cb) {
    return this.db.get(what).then((doc)=> {
      cb(doc.data);
    }).catch((error)=>{
      cb(error);
    });

  }

  handleError(error) {
    switch (error.status) {
      case 404:
        this.put(data);
        break;
      case 409:
        console.log('[DataBaseConnector] conflict error: ' + error + ' while attempting to update: ' + what + ' data: ' + data + ' rev: ' + rev);
        break;
      default:
        console.log('[DataBaseConnector] error: ' + error + ' while attempting to update: ' + what + ' data: ' + data);
    }
  }
};
