'use strict';
const Map = require("collections/map");
const ConfigService = require('./ConfigService.js');
const WorldDAO = require('./WorldDAO');
const WebSocket = require('ws');
const fs = require("fs");
const PlayerTracker = require('./PlayerTracker');
const PacketHandler = require('./PacketHandler');

const utilities = require('./utilities.js');
const Physics = require('./Physics.js');
const Colors = require('./Colors.js');

//// Handle arguments
//let id = process.argv[0],
//  ip = process.argv[1],
//  port = process.argv[2];
//
//
//// There is no stopping an exit so clean up
//// NO ASYNC CODE HERE - only use SYNC or it will not happen
//process.on('exit', (code) => {
//  console.log("ClientServer terminated with code: " + code);
//});


module.exports = class ClientServer {
  constructor(id, ip, port) {
    this._id = id;
    this._ip = ip;
    this._port = port;
    this._ipcounts = [];
    this._nospawn = []; // todo do we really need this?
    this._banned = []; // todo do we really need this?
    this._whlist = []; // todo do we really need this?

    this._configService = new ConfigService();
    this._config = this._configService.registerListener('config', (newConfig)=>this.config = newConfig);

    // id's are unique to each client server 1-2147483647
    this._lastPlayerId = 1;
    this._lastNodeId = 2147483647;

    this._clients = new Map();

    this._world = new WorldDAO();

    this.start();
  }

  start() {
    // Logging
    // todo
    // this.log.setup(this);

    // Gamemode configurations
    // todo
    //this.world.getGameMode().onServerInit(this);

    // Start the server
    this.socketServer = new WebSocket.Server({
      port: this._port,
      perMessageDeflate: false
    }, this.socketServerStart.bind(this));

    this.socketServer.on('connection', this.connectionEstablished.bind(this));

    // Properly handle errors because some people are too lazy to read the readme
    this.socketServer.on('error', this.socketServerOnError.bind(this));

    setTimeout(this.update.bind(this), 10);
  };

  update() {

    // Timer
    let local = new Date();
    this.tick += (local - this.time);
    this.time = local;

    if (this.tick >= 1000 / this.config.fps) {
      // Loop main functions
      // Move cells
      this.updateMoveEngine();
      this.gameModeTick();

      // Update the client's maps
      this.updateClients();
      setTimeout(this.updateCells(), 0);

      // Update cells/leaderboard loop
      this.tickMain++;

      if (this.tickMain >= this.config.fps) { // 1 Second
        this.duplicateMouseCheck();
        this.rainBowTick();
        //this.pluginTick();
        this.leaderBoardTick();
      }

      // Reset
      this.tick = 0;
      let humans = this.botSpawnerTick();

      // Restart main loop immediately after current event loop (setImmediate does not amplify any lag delay unlike setInterval or setTimeout)
      setImmediate(this.update.bind(this));
    } else {
      // Restart main loop 1 ms after current event loop (setTimeout uses less cpu resources than setImmediate)
      setTimeout(this.update.bind(this), 1);
    }
  }

  updateMoveEngine() {
    function sorter(nodeA, nodeB) {
      return Physics.getDist(nodeA.position, nodeA.owner.mouse) > Physics.getDist(nodeB.position, nodeB.owner.mouse);
    }

    // move player cells
    let nodes = this.world.getNodes('player');
    // todo disabled sorting for now
    //nodes.sorted(sorter);
    nodes.forEach((cell)=> {
      // Do not move cells that have already been eaten or have collision turned off
      if (!cell) {
        return;
      }
      let client = cell.owner;
      cell.calcMove(client.mouse.x, client.mouse.y, this.world);

      // Check if cells nearby
      let list = this.getCellsInRange(cell);
      list.forEach((check)=> {
        if (check.cellType === 0 && (client != check.owner) && (cell.mass < check.mass * 1.25) && this.config.playerRecombineTime !== 0) { //extra check to make sure popsplit works by retslac
          check.inRange = false;
          return;
        }

        // Consume effect
        check.onConsume(cell, this.world, this);

        // Remove cell
        check.setKiller(cell);
        this.removeNode(check);
      });
    });


    // A system to move cells not controlled by players (ex. viruses, ejected mass)
    this.getWorld().getNodes('moving').forEach((check)=> {
      if (check.moveEngineTicks > 0) {
        check.onAutoMove(this.getWorld());
        // If the cell has enough move ticks, then move it
        check.calcMovePhys(this.config);
      } else {
        // Auto move is done
        check.moveDone(this.getWorld());
        // Remove cell from list
        this.getWorld().removeMovingNode(check);
      }
    });
  }

  gameModeTick() {
    // Gamemode tick
    let t = this.config.fps / 20;
    if (this.gtick >= Math.round(t) - 1) {
      this.getWorld().getGameMode().onTick(this);
      this.gtick = 0;
    } else {
      this.gtick++;
    }

  };

  updateCells() {
    // Loop through all player cells
    this.getWorld().getNodes('player').forEach((cell)=> {
      if (!cell) {
        return;
      }
      // Have fast decay over 5k mass
      let massDecay = 0;
      if (this.config.playerFastDecay == 1) {
        if (cell.mass < this.config.fastdecayrequire) {
          massDecay = 1 - (this.config.playerMassDecayRate * this.getWorld().getGameMode().decayMod * 0.05); // Normal decay
        } else {
          massDecay = 1 - (this.config.playerMassDecayRate * this.getWorld().getGameMode().decayMod) * this.config.FDmultiplyer; // might need a better formula
        }
      } else {
        massDecay = 1 - (this.config.playerMassDecayRate * this.getWorld().getGameMode().decayMod * 0.05);
      }

      // Recombining
      if (cell.owner.cells.length > 1 && !cell.owner.norecombine) {
        cell.recombineTicks += 0.05;
        cell.calcMergeTime(this.config.playerRecombineTime);
      } else if (cell.owner.cells.length == 1 && cell.recombineTicks > 0) {
        cell.recombineTicks = 0;
        cell.shouldRecombine = false;
        cell.owner.recombineinstant = false;
      }

      // Mass decay
      if (cell.mass >= this.config.playerMinMassDecay) {
        let client = cell.owner;
        if (this.config.teaming === 0) {
          let teamMult = (client.massDecayMult - 1) / 160 + 1; // Calculate anti-teaming multiplier for decay
          let thisDecay = 1 - massDecay * (1 / teamMult); // Reverse mass decay and apply anti-teaming multiplier
          cell.mass *= (1 - thisDecay);
        } else {
          // No anti-team
          cell.mass *= massDecay;
        }
      }
    });
  }

  duplicateMouseCheck() {
    let a = [];
    let d = false;
    this.getWorld().getClients().forEach((client)=> {
      if (client.remoteAddress && this.whlist.indexOf(client.remoteAddress) == -1 && !client.playerTracker.nospawn) {
        if (a[client.playerTracker.mouse] === undefined) {
          a[client.playerTracker.mouse] = 1;

        } else { // Where it checks for duplicates. If there is over 5, it activates mouse filter using mfre, to see how it works, go to playertracker. This is here so i can reduce lag using a simple and less cpu using method to check for duplicates because the method to actually get rid of them is not efficient.
          a[client.playerTracker.mouse]++;
          if (a[client.playerTracker.mouse] > this.config.mbchance) {
            this.mfre = true;
            d = true;
          }
        }
      }
    });
    if (d == false) this.mfre = false;
  }

  rainBowTick() {
    // Todo need to check up on this see what/if needs to be done
    let count = 0;
    let rainbowNodes = this.getWorld().getNodes('rainbow');
    rainbowNodes.forEach((node)=> {
      if (!node) return;
      count++;

      node.rainbow = (node.rainbow) ? node.rainbow : Math.floor(Math.random() * Colors.length);
      node.rainbow = (node.rainbow >= Colors.length) ? 0 : node.rainbow;

      node.color = Colors[node.rainbow];
      node.rainbow += this.config.rainbowspeed;
    });

    if (count <= 0) this.getWorld().getNodes('rainbow').clear();

    this.getWorld().getClients().forEach((client)=> {
      // todo likely do not need the client check as it was not included above - this is most likely defensive programming
      if (client.cells && client.playerTracker.rainbowon) {
        client.cells.forEach((cell)=>this.getWorld().setNode(cell._id, cell, 'rainbow'));
      }
    });

    let rNodes = this.getWorld().getNodes('rainbow');
    if (rNodes.length > 0) {

      if (this.rrticks > 40) {
        this.rrticks = 0;
        this.getWorld().getNodes('rainbow').clear();

      } else {
        this.rrticks++;
      }
    }
  }

  leaderBoardTick() {
    // Update leaderboard with the gamemode's method
    this.leaderboard = [];
    this.getWorld().getGameMode().updateLB(this);
    this.lb_packet = new Packet.UpdateLeaderboard(this.leaderboard, this.getWorld().getGameMode().packetLB, this.customLBEnd);

    this.tickMain = 0; // Reset
    if (!this.getWorld().getGameMode().specByLeaderboard) {
      // Get client with largest score if gamemode doesn't have a leaderboard
      let largestClient = undefined;
      let largestClientScore = 0;

      this.getWorld().getClients.forEach((client)=> {
        let clientScore = client.playerTracker.getScore(true);
        if (clientScore > largestClientScore) {
          largestClient = client;
          largestClientScore = clientScore;
        }
      });

      this.largestClient = largestClient;
    } else this.largestClient = this.leaderboard[0];
  }

  botSpawnerTick() {
    let humans = 0,
      bots = 0;

    this.getWorld().clients.forEach((client)=> {
      if (client.playerTracker.type === 'human') {
        humans++;
      } else {
        bots++;
      }
    });

    if (this.config.smartbotspawn === 1) {
      if (bots < this.config.smartbspawnbase - humans + this.sbo && humans > 0) {
        this.livestage = 2;
        this.liveticks = 0;

        this.bots.addBot();

      } else if (this.config.smartbspawnbase - humans + this.sbo > 0) {
        let numToKick = ((this.config.smartbspawnbase - humans + this.sbo) - bots) * -1;
        this.kickBots(numToKick)
      }
    }
    return humans;
  }


  isValidClient(origin) {
    if (this.config.clientclone != 1) {
      // ----- Client authenticity check code -----
      // !!!!! WARNING !!!!!
      // THE BELOW SECTION OF CODE CHECKS TO ENSURE THAT CONNECTIONS ARE COMING
      // FROM THE OFFICIAL AGAR.IO CLIENT. IF YOU REMOVE OR MODIFY THE BELOW
      // SECTION OF CODE TO ALLOW CONNECTIONS FROM A CLIENT ON A DIFFERENT DOMAIN,
      // YOU MAY BE COMMITTING COPYRIGHT INFRINGEMENT AND LEGAL ACTION MAY BE TAKEN
      // AGAINST YOU. THIS SECTION OF CODE WAS ADDED ON JULY 9, 2015 AT THE REQUEST
      // OF THE AGAR.IO DEVELOPERS.
      if (origin != 'http://agar.io' &&
        origin != 'https://agar.io' &&
        origin != 'http://localhost' &&
        origin != 'https://localhost' &&
        origin != 'http://127.0.0.1' &&
        origin != 'https://127.0.0.1') {
        return false;
      }
    }
    return true;
  }

  socketServerOnError(error) {
    switch (error.code) {
      case "EADDRINUSE":
        console.log("[Error] Server could not bind to port! Please close out of Skype or change 'serverPort' in gameserver.ini to a different number.");
        break;
      case "EACCES":
        console.log("[Error] Please make sure you are running Ogar with root privileges.");
        break;
      default:
        console.log("[Error] Unhandled error code: " + error.code);
        break;
    }
    process.exit(1); // Exits the program
  }

  connectionEstablished(ws) {
    let clients = this.world.getClients();
    if (clients.length >= this.config.serverMaxConnections) { // Server full
      ws.close();
      return;
    }
    if (!this.isValidClient(ws.upgradeReq.headers.origin)) {
      ws.close();
      return;
    }

    // -----/Client authenticity check code -----
    if ((this._ipcounts[ws._socket.remoteAddress] >= this.config.serverMaxConnectionsPerIp) && (this.whlist.indexOf(ws._socket.remoteAddress) == -1)) {

      this._nospawn[ws._socket.remoteAddress] = true;

      if (this.config.autoban == 1 && (this.banned.indexOf(ws._socket.remoteAddress) == -1)) {
        if (this.config.showbmessage == 1) {
          console.log("Added " + ws._socket.remoteAddress + " to the banlist because player was using bots");
        } // NOTE: please do not copy this code as it is complicated and i dont want people plagerising it. to have it in yours please ask nicely

        this._banned.push(ws._socket.remoteAddress);
        if (this.config.autobanrecord == 1) {
          let oldstring = "";
          let string = "";
          for (let i in this._banned) {
            let banned = this._banned[i];
            if (banned != "") {

              string = oldstring + "\n" + banned;
              oldstring = string;
            }
          }

          fs.writeFile('./banned.txt', string);
        }
        // Remove from game
        clients.forEach((client)=> {
          if (client.remoteAddress && client.remoteAddress == ws._socket.remoteAddress) {
            //this.socket.close();
            client.close(); // Kick out
            // todo make this apart of the close?
            clients.delete(client.id);
          }
        });
      }
    } else {
      this._nospawn[ws._socket.remoteAddress] = false;
    }
    if ((this._banned.indexOf(ws._socket.remoteAddress) != -1) && (this._whlist.indexOf(ws._socket.remoteAddress) == -1)) { // Banned
      if (this.config.showbmessage == 1) {
        console.log("Client " + ws._socket.remoteAddress + ", tried to connect but is banned!");
      }
      this._nospawn[ws._socket.remoteAddress] = true;
    }
    if (this._ipcounts[ws._socket.remoteAddress]) {
      this._ipcounts[ws._socket.remoteAddress]++;
    } else {
      this._ipcounts[ws._socket.remoteAddress] = 1;
    }

    if (this.config.showjlinfo == 1) {
      console.log("A player with an IP of " + ws._socket.remoteAddress + " joined the game");
    }
    if (this.config.porportional == 1) {
      this.config.borderLeft -= this.config.borderDec;
      this.config.borderRight += this.config.borderDec;
      this.config.borderTop -= this.config.borderDec;
      this.config.borderBottom += this.config.borderDec;
    }

    // todo this code makes my head hurt! PlayerTacker should own the ws and we should not modify the ws
    ws.remoteAddress = ws._socket.remoteAddress;
    ws.remotePort = ws._socket.remotePort;
    // todo this.log.onConnect(ws.remoteAddress); // Log connections

    ws.playerTracker = new PlayerTracker(this, ws);
    ws.packetHandler = new PacketHandler(this, ws, this.config, this.world);
    ws.on('message', ws.packetHandler.handleMessage.bind(ws.packetHandler));

    let bindObject = {
      server: this,
      socket: ws
    };
    ws.on('error', this.socketServerClose.bind(bindObject));
    ws.on('close', this.socketServerClose.bind(bindObject));
    this.world.addClient(ws.playerTracker.id, ws);
  }

  socketServerClose(error) {
    let server = this.server;
    server._ipcounts[this.socket.remoteAddress]--;
    // Log disconnections
    if (server.config.showjlinfo == 1) {
      console.log("A player with an IP of " + this.socket.remoteAddress + " left the game");
    }
    if (server.config.porportional == 1) {
      server.config.borderLeft += server.config.borderDec;
      server.config.borderRight -= server.config.borderDec;
      server.config.borderTop += server.config.borderDec;
      server.config.borderBottom -= server.config.borderDec;

      server.world.getNodes().forEach((node)=> {
        if ((!node) || (node.getType() == 0)) {
          return;
        }

        // Move
        if (node.position.x < server.config.borderLeft) {
          server.removeNode(node);
          i--;
        } else if (node.position.x > server.config.borderRight) {
          server.removeNode(node);
          i--;
        } else if (node.position.y < server.config.borderTop) {
          server.removeNode(node);
          i--;
        } else if (node.position.y > server.config.borderBottom) {
          server.removeNode(node);
          i--;
        }
      });
    }
    // fixme this.server.log.onDisconnect(this.socket.remoteAddress);

    let client = this.socket.playerTracker;
    let len = this.socket.playerTracker.cells.length;

    for (let i = 0; i < len; i++) {
      let cell = this.socket.playerTracker.cells[i];

      if (!cell) {
        continue;
      }

      cell.calcMove = function () {

      }; // Clear function so that the cell cant move
      //this.server.removeNode(cell);
    }

    client.disconnect = this.server.config.playerDisconnectTime * 20;
    this.socket.sendPacket = function () {

    }; // Clear function so no packets are sent
  }

  socketServerStart() {
    // Start Main Loop
    //setInterval(this.mainLoop.bind(this), 1);
    setImmediate(this.mainLoopBind);

    console.log("[Game] Listening on port " + this._port);
    console.log("[Game] Current game mode is " + this._world.getGameMode().name);

    // todo this needs to be moved somewhere else
    //Cell.spi = this.config.SpikedCells;
    //Cell.virusi = this.config.viruscolorintense;
    //Cell.recom = this.config.playerRecombineTime;
    //if (this.config.anounceHighScore === 1) {
    //  this.consoleService.execCommand("announce", "");
    //}

    // todo bots will have their own process/server
    // Player bots (Experimental)
    //if (this.config.serverBots > 0) {
    //  for (let i = 0; i < this.config.serverBots; i++) {
    //    this.bots.addBot();
    //  }
    //  console.log("[Game] Loaded " + this.config.serverBots + " player bots");
    //}
    //if (this.config.restartmin != 0) {
    //  let split = [];
    //  split[1] = this.config.restartmin;
    //
    //  this.consoleService.execCommand("restart", split);
    //
    //}
  }

  getNextPlayerId() {
    if (this._lastPlayerId > 2147483647) {
      this.lastPlayerId = 1;
    }
    return this._id + "." + this.lastPlayerId++;
  }

  // todo temp function
  getWorld() {
    return this.world;
  }

  //@formatter:off
  // es6 getter/setters
  get config () { return this._config; }
  set config (config) { this._config = config; }
  get clients () { return this._clients; }
  get world () { return this._world; }
  get whlist () { return this._whlist; }

  //@formatter:on
}
;

// Custom prototype functions
WebSocket.prototype.sendPacket = function (packet) {
  function getBuf(data) {
    let array = new Uint8Array(data.buffer || data);
    let l = data.byteLength || data.length;
    let o = data.byteOffset || 0;
    let buffer = new Buffer(l);

    for (let i = 0; i < l; i++) {
      buffer[i] = array[o + i];
    }

    return buffer;
  }

  //if (this.readyState == WebSocket.OPEN && (this._socket.bufferSize == 0) && packet.build) {
  if (this.readyState == WebSocket.OPEN && packet.build) {
    let buf = packet.build();
    this.send(getBuf(buf), {
      binary: true
    });
  } else if (!packet.build) {
    // Do nothing
  } else {
    this.readyState = WebSocket.CLOSED;
    this.emit('close');
    this.removeAllListeners();
  }
};

