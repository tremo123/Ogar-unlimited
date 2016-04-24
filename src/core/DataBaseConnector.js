"use strict";
const PouchDB = require('pouchdb');

module.exports = class DataBaseConnector {
  constructor(dataBase, host, port) {
    this._dataBase = dataBase;
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
      .catch(this.handleError(data));
  }

  update(data) {
    this.db.get(data._id).then((doc)=> {
      //console.log('doc._id: ' + doc._id + '  doc rev: ' + doc._rev);
      data._rev = doc._rev;
      return this.db.put(data);
    }).catch((error)=> {
      if (error.status === 404) {
        this.put(data);
      } else {
        this.handleError(error)
      }

    });
  }

  get(what, cb) {
    return this.db.get(what).then((doc)=> {
      cb(doc.data);
    }).catch((error)=> {
      cb(error);
    });
  }

  remove(what) {
    return this.db.get(what).then((doc)=> {
        doc._deleted = true;
        this.db.put(doc)
      })
      .catch((error)=> {
        // error = 404 then ignore - just means that what we tried to delete was already deleted.
        if (error.status === 404) return;

        console.error('Failed to remove: ' + JSON.stringify(what) + ' from: ' + this._dataBase + ' reason: ' + error)
      });
  }

  // todo this doesn't work :( and I don't know why! It is being called and the returned function is being called
  // todo the error object is passed in but the switch doesn't handle it.
  handleError(what) {
    return (error) => {
      //console.log(error)
      switch (parseInt(error.status)) {
        case 409:
          console.log('[DataBaseConnector] conflict error: ' + error + ' while attempting to update: ' + what + ' data: ' + data + ' rev: ' + rev);
          break;
        default:
          console.log('[DataBaseConnector] error: ' + error + ' while attempting to update: ' + what + ' data: ' + data);
      }
    }
  }

};
