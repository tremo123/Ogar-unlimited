'use strict';
var http = require('http');

module.exports = class InfoServer {
  constructor(multiverse, port, serverStatsUpdateTime) {
    this.multiverse = multiverse;
    this.port = port;
    this.serverStatsUpdateTime = (serverStatsUpdateTime) ? serverStatsUpdateTime : 1;
    this.stats = "";
    this.interveral = undefined;
this.isMaster = ismaster;
  }

  start() {
    // Do not start the server if the port is negative
    if (this.port < 1) {
      return;
    }
    // init stats
    this.update();

    // Show stats
    this.httpServer = http.createServer(function (req, res) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.writeHead(200);
      res.end(this.getStats());
    }.bind(this));

    this.httpServer.listen(this.port, function () {
      // Stats server
      console.log("[Game] Loaded info server on port " + this.port);
      setInterval(this.update.bind(this), this.serverStatsUpdateTime * 1000);
    }.bind(this));
  }

  stop() {
    if (this.interveral) {
      clearInterval(this.interveral);
    }
    if (this.httpServer)
    this.httpServer.close()
  }

  update() {
   
    var s = {
     
    };
    this.stats = JSON.stringify(s);
  }

  getStats() {
    return this.stats;
  }
};
