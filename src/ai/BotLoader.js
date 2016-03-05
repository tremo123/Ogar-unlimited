// Project imports
var BotPlayer = require('./BotPlayer');
var FakeSocket = require('./FakeSocket');
var PacketHandler = require('../PacketHandler');

function BotLoader(gameServer) {
  this.gameServer = gameServer;
  this.loadNames();
}

module.exports = BotLoader;

BotLoader.prototype.getName = function () {
  var name = "";
 if (this.gameServer.config.botrealnames == 1) {
   if (this.realrandomNames.length > 0) {
    var index = Math.floor(Math.random() * this.realrandomNames.length);
    name = this.realrandomNames[index];
    this.realrandomNames.splice(index, 1);
  } else {
    name = "bot" + ++this.nameIndex;
  }
   
 } else {
  // Picks a random name for the bot
  if (this.randomNames.length > 0) {
    var index = Math.floor(Math.random() * this.randomNames.length);
    name = this.randomNames[index];
    this.randomNames.splice(index, 1);
  } else {
    name = "bot" + ++this.nameIndex;
  }
 }

  return name;
};

BotLoader.prototype.loadNames = function () {
  this.randomNames = [];
this.realrandomNames = [];

  // Load names
    
    try {
    var fs = require("fs"); // Import the util library

    // Read and parse the names - filter out whitespace-only names
    // todo should we use readFileSync? likely doesn't matter here as this looks to be call on sever start
    this.realrandomNames = fs.readFileSync("./realisticnames.txt", "utf8").split(/[\r\n]+/).filter(function (x) {
      return x != ''; // filter empty names
    });
  } catch (e) {
    // Nothing, use the default names
  }
 
  
  try {
    var fs = require("fs"); // Import the util library

    // Read and parse the names - filter out whitespace-only names
    // fs.readFileSync is only used during server start
    this.randomNames = fs.readFileSync("./botnames.txt", "utf8").split(/[\r\n]+/).filter(function (x) {
      return x != ''; // filter empty names
    });
  } catch (e) {
    // Nothing, use the default names
  }

  this.nameIndex = 0;
};

BotLoader.prototype.addBot = function () {
  var s = new FakeSocket(this.gameServer);
  s.playerTracker = new BotPlayer(this.gameServer, s);
  s.packetHandler = new PacketHandler(this.gameServer, s);

  // Add to client list
  this.gameServer.clients.push(s);

  // Add to world
  s.packetHandler.setNickname(this.getName());
};
