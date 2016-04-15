'use strict';
const fs = require("fs");
const WebSocket = require('ws');
const Updater = require('./Updater.js');
const utilities = require('./utilities.js');
const Physics = require('./Physics.js');
const Colors = require('./Colors.js');

const Gamemode = require('../gamemodes');
const Packet = require('../packet');
const Entity = require('../entity');
const Cell = require('../entity/Cell.js');
const PlayerTracker = require('./PlayerTracker');
const PacketHandler = require('./PacketHandler');

const BotLoader = require('../ai/BotLoader');
const MinionLoader = require('../ai/MinionLoader');

// services
const Logger = require('../modules/log');
const StatServer = require('./StatServer.js');
const GeneratorService = require('./GeneratorService.js');
const PluginLoader = require('./PluginLoader.js');

const DataBaseConnector = require('./DataBaseConnector.js');

module.exports = class GameServer {
  constructor(world, consoleService, configService) {
    // fields
    this.world = world;
    this.dataBase = new DataBaseConnector('world');

    this.lastPlayerId = 1;
    this.running = true;

    // inprogress
    this.whlist = [];
    this.nospawn = [];

    this.leaderboard = []; // leaderboard
    this.lb_packet = new ArrayBuffer(0); // Leaderboard packet
    this.bots = new BotLoader(this);
    this.updater = new Updater(this);
    this.minions = new MinionLoader(this);

    // Config
    this.configService = configService;
    this.config = this.configService.registerListner('config', (config)=>this.config = config);
    this.banned = this.configService.registerListner('banned', (banned)=>this.banned = banned);
    this.opbyip = this.configService.registerListner('opbyip', (opbyip)=>this.opbyip = opbyip);
    this.highscores = this.configService.registerListner('highscores', (highscores)=>this.highscores = highscores);
    this.randomNames = this.configService.registerListner('botnames', (botnames)=>this.randomNames = botnames);
    this.skinshortcut = this.configService.registerListner('skinshortcuts', (skinshortcuts)=>this.skinshortcut = skinshortcuts);
    this.skin = this.configService.registerListner('skins', (skins)=>this.skin = skins);

    // plugins
    this.pluginLoader = new PluginLoader(this);
    this.pluginLoader.load();
    this.pluginGamemodes = this.pluginLoader.getPGamemodes();
    this.plugins = this.pluginLoader.getPlugin();
    this.pluginCommands = this.pluginLoader.getPC();

    // services - must run after config with the exception of the config service
    this.consoleService = consoleService;
    this.generatorService = new GeneratorService(world);
    this.log = new Logger();
    this.statServer = new StatServer(this, this.config.serverStatsPort, this.config.serverStatsUpdate);

    //bound
    this.mainLoopBind = this.mainLoop.bind(this);

    // others
    this.branch = "dev";
    this.customLBEnd = [];
    this.gtick = 0;
    this.uv = "";

    this.sbo = 1;
    this.ipCounts = [];
    this.minionleader = undefined;

    this.destroym = false;
    this.lleaderboard = false;
    this.topscore = 50;
    this.topusername = "None";
    this.red = false;
    this.green = false;
    this.rrticks = 0;
    this.minion = false;
    this.miniontarget = {x: 0, y: 0};
    this.blue = false;
    this.bold = false;
    this.white = false;
    this.dltick = 0;
    this.mfre = false; // If true, mouse filter is initialised
    this.dim = false;
    this.yellow = false;
    this.resticks = 0;
    this.spawnv = 1;
    this.lctick = 0;
    this.overideauto = false;
    this.livestage = 0;
    this.pop = [];
    this.troll = [];
    this.firstl = true;
    this.liveticks = 0;
    this.op = [];
    this.pmsg = 0;
    this.pfmsg = 0;
    this.opc = [];
    this.oppname = [];
    this.opname = [];

    this.oldtopscores = {
      score: 100,
      name: "none"
    };


    this.leaderboard = []; // leaderboard
    this.lb_packet = new ArrayBuffer(0); // Leaderboard packet
    this.largestClient = undefined;

    // Main loop tick
    this.time = +new Date;
    this.startTime = this.time;
    this.tick = 0; // 1 second ticks of mainLoop
    this.tickMain = 0; // 50 ms ticks, 20 of these = 1 leaderboard update
    this.tickSpawn = 0; // Used with spawning food
    this.mainLoopBind = this.mainLoop.bind(this);

    this.colors = Colors;
  }

  // init should only ever be called once.
  init() {
    this.dataBase.onChange((data)=> {
      //console.log('Data from dataBase: ' + JSON.stringify(data));
    });

  }

  start() {
    // Logging
    this.log.setup(this);

    this.ipcounts = [];
    // Gamemode configurations
    this.getWorld().getGameMode().onServerInit(this);
    this.masterServer();

    // Start the server
    this.socketServer = new WebSocket.Server({
      port: (this.config.vps === 1) ? process.env.PORT : this.config.serverPort,
      perMessageDeflate: false
    }, this.socketServerStart.bind(this));

    this.socketServer.on('connection', this.connectionEstablished.bind(this));

    // Properly handle errors because some people are too lazy to read the readme
    this.socketServer.on('error', this.socketServerOnError.bind(this));

    this.statServer.start();
  };

  update(dt) {

  }

  pause() {
    this.running = false;
    this.generatorService.stop()
  }

  unpause() {
    this.running = true;
    this.generatorService.start()
  }

  getWorld() {
    // todo this is temp until I can finish setting up the db stuff
    return this.generatorService.world;
    //return this.world;
  }


  // todo need to think about how to refactor this out to use the world.addNode or setNode
  // todo for now leave it here
  addNode(node, type) {
    this.getWorld().setNode(node.getId(), node, type);

    //this._nodes.push(node);
    //if (type === "moving") {
    //  this.setAsMovingNode(node);
    //}

    // todo this is a big problem for splitting up the processes
    // Adds to the owning player's screen
    //if (node.owner) {
    //  node.setColor(node.owner.color);
    //  node.owner.cells.push(node);
    //  node.owner.socket.sendPacket(new Packet.AddNode(node));
    //}
    //
    //// Special on-add actions
    //node.onAdd(this);
    //
    //// todo this is a big problem for splitting up the processes
    //// Add to visible nodes
    //let clients = this.getClients();
    //for (let i = 0; i < clients.length; i++) {
    //  let client = clients[i].playerTracker;
    //  if (!client) {
    //    continue;
    //  }
    //
    //  // todo memory leak?
    //  // client.nodeAdditionQueue is only used by human players, not bots
    //  // for bots it just gets collected forever, using ever-increasing amounts of memory
    //  if ('_socket' in client.socket && node.visibleCheck(client.viewBox, client.centerPos)) {
    //    client.nodeAdditionQueue.push(node);
    //  }
    //}
  }

  // todo need to think about how to refactor this out
  removeNode(node) {
    this.getWorld().removeNode(node.getId());
    // Special on-remove actions
    //node.onRemove(this);
    //
    //// todo this is a big problem for splitting up the processes
    //// Animation when eating
    //let clients = this.getClients();
    //for (let i = 0; i < clients.length; i++) {
    //  let client = clients[i].playerTracker;
    //  if (!client) {
    //    continue;
    //  }
    //
    //  // Remove from client
    //  client.nodeDestroyQueue.push(node);
    //}
  }

  getNearestNodeToNode(node, type, radius) {
    return this.getWorld().getNearestNodeToNode(node, type, radius);
  }

  clearLeaderBoard() {
    this.leaderboard = [];
  }

  getRandomColor() {
    return utilities.getRandomColor();
  }

  // todo change this out for a vector library
  static getDist(x1, y1, x2, y2) {
    return utilities.getDist(x1, y1, x2, y2);
  }

  getMode() {
    return this.getWorld().getGameMode();
  }

  updateMoveEngine() {
    function sorter(nodeA, nodeB) {
      return Physics.getDist(nodeA.position, nodeA.owner.mouse) > Physics.getDist(nodeB.position, nodeB.owner.mouse);
    }

    let nodes = this.getWorld().getNodes('player');
    nodes.sorted(sorter);
    nodes.forEach((cell)=> {
      // Do not move cells that have already been eaten or have collision turned off
      if (!cell) {
        return;
      }

      let client = cell.owner;
      cell.calcMove(client.mouse.x, client.mouse.y, this.getWorld());

      // Check if cells nearby
      let list = this.getCellsInRange(cell);
      list.forEach((check)=> {
        if (check.cellType === 0 && (client != check.owner) && (cell.mass < check.mass * 1.25) && this.config.playerRecombineTime !== 0) { //extra check to make sure popsplit works by retslac
          check.inRange = false;
          return;
        }

        // Consume effect
        check.onConsume(cell, this.getWorld(), this);

        // Remove cell
        check.setKiller(cell);
        this.removeNode(check);
      });
    });


    // A system to move cells not controlled by players (ex. viruses, ejected mass)
    this.getWorld().getMovingNodes().forEach((check)=> {
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

  updateCells() {
    if (!this.running) {
      // Server is paused
      return;
    }

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

  spawnPlayer(player, pos, mass) {
    let dono = false;
    let dospawn = false;
    clearTimeout(player.spect);
    if (this.nospawn[player.socket.remoteAddress] != true && !player.nospawn) {

      if (this.config.verify != 1 || (this.whlist.indexOf(player.socket.remoteAddress) != -1)) {
        player.verify = true;
      }
      player.norecombine = false;
      player.frozen = false;
      if (this.config.verify == 1 && !player.verify) {
        if (player.tverify || typeof player.socket.remoteAddress == "undefined") {
          player.verify = true;
          player.vfail = 0;
        }
        if (typeof player.socket.remoteAddress != "undefined" && !player.verify && !player.tverify) {
          if (player.name == player.vpass) {
            player.tverify = true;
            player.name = "Success! Press w and get started!";
            dono = true;
            player.vfail = 0;


          } else {
            if (player.vfail == 0) {
              player.vname = player.name;
            }
            player.newV();

            player.name = "Please Verify By typing " + player.vpass + " Into nickname box. Kill = w";
            dono = true;
            player.vfail++;
            if (player.vfail > this.config.vchance) {
              player.nospawn = true;
            }
            //let pl = player;
            let self = this;
            setTimeout(function () {
              if (!player.verify && !player.tverify) {
                let len = player.cells.length;
                for (let j = 0; j < len; j++) {
                  self.removeNode(player.cells[0]);
                }
              }
            }, self.config.vtime * 1000);
          }
        }
      } else if (player.vname != "") {
        if (player.name == player.vpass) {
          player.name = player.vname;
        }

      }
      let name;
      if (this.config.randomnames == 1 && !dono) {
        if (this.randomNames.length > 0) {
          let index = Math.floor(Math.random() * this.randomNames.length);
          name = this.randomNames[index];
          this.randomNames.splice(index, 1);
        } else {
          name = "player";
        }
        player.name = name;
      } else {
        if (this.config.skins == 1 && !dono) {
          if (player.name.substr(0, 1) == "<") {
            // Premium Skin
            let n = player.name.indexOf(">");
            if (n != -1) {
              if (player.name.substr(1, n - 1) == "r" && this.config.rainbow == 1) {
                player.rainbowon = true;
              } else {
                player.premium = '%' + player.name.substr(1, n - 1);
              }

              for (let i in this.skinshortcut) {
                if (!this.skinshortcut[i] || !this.skin[i]) {
                  continue;
                }
                if (player.name.substr(1, n - 1) == this.skinshortcut[i]) {
                  player.premium = this.skin[i];
                  break;
                }

              }
              player.name = player.name.substr(n + 1);
            }
          } else if (player.name.substr(0, 1) == "[") {
            // Premium Skin
            let n = player.name.indexOf("]");
            if (n != -1) {

              player.premium = ':http://' + player.name.substr(1, n - 1);
              player.name = player.name.substr(n + 1);
            }
          }
        }
      }
      pos = (pos == null) ? this.generatorService.getRandomSpawn() : pos;
      mass = (mass == null) ? this.config.playerStartMass : mass;
      mass = (player.spawnmass > mass) ? player.spawnmass : mass;

      // Spawn player and add to world
      if (!dospawn) {
        console.log('Spawn player test 1')
        let cell = new Entity.PlayerCell(this.getWorld().getNextNodeId(), player, pos, mass, this.getWorld(), this.getConfig());
        console.log('Spawn player test 2')
        this.getWorld().setNode(cell.getId(), cell, "player");
        console.log('Spawn player test 3')
      }
      // Set initial mouse coords
      player.mouse = {
        x: pos.x,
        y: pos.y
      };
    }
  }

  // getters/setters
  getClients() {
    return this.getWorld().getClients();
  }

  addClient(client) {
    this.getWorld().addClient(client);
  }

  removeClient(client) {
    this.getWorld().removeClient(client);
  }

  getCurrentFood() {
    return this.generatorService.getCurrentFood();
  }

  getConfig() {
    return this.config;
  }

  getCellsInRange(cell) {
    let list = [];
    let squareR = cell.getSquareSize(); // Get cell squared radius

    // Loop through all cells that are visible to the cell. There is probably a more efficient way of doing this but whatever
    cell.owner.visibleNodes.forEach((check)=> {
      // exist?
      // if something already collided with this cell, don't check for other collisions
      // Can't eat itself
      if (!check || check.inRange || cell.getId() === check.getId()) return;

      // Can't eat cells that have collision turned off
      if ((cell.owner === check.owner) && (cell.ignoreCollision)) return;

      // AABB Collision
      if (!check.collisionCheck2(squareR, cell.position)) return;

      // Cell type check - Cell must be bigger than this number times the mass of the cell being eaten
      let multiplier = 1.25;

      switch (check.getType()) {
        case 1: // Food cell
          list.push(check);
          check.inRange = true; // skip future collision checks for this food
          return;
        case 2: // Virus
          multiplier = 1.33;
          break;
        case 5: // Beacon
          // This cell cannot be destroyed
          return;
        case 0: // Players
          // Can't eat self if it's not time to recombine yet
          if (check.owner === cell.owner) {
            if ((!cell.shouldRecombine || !check.shouldRecombine) && !cell.owner.recombineinstant) {
              return;
            }
            multiplier = 1.00;
          }
          // Can't eat team members
          if (this.getWorld().getGameMode().haveTeams) {
            if (!check.owner && (check.owner !== cell.owner) && (check.owner.getTeam() === cell.owner.getTeam())) {
              return;
            }
          }
          break;
      }

      // Make sure the cell is big enough to be eaten.
      if ((check.mass * multiplier) > cell.mass) return;

      // Eating range
      let xs = Math.pow(check.position.x - cell.position.x, 2);
      let ys = Math.pow(check.position.y - cell.position.y, 2);
      let dist = Math.sqrt(xs + ys);

      let eatingRange = cell.getSize() - check.getEatingRange(); // Eating range = radius of eating cell + 40% of the radius of the cell being eaten

      // Not in eating range
      if (dist > eatingRange) return;

      // Add to list of cells nearby
      list.push(check);

      // Something is about to eat this cell; no need to check for other collisions with it
      check.inRange = true;
    });

    return list;
  };

  getNearestVirus(cell) {
    return this.getWorld().getNearestNodeToNode(cell, 'virus');
  };

  switchSpectator(player) {
    if (this.getWorld().getGameMode().specByLeaderboard) {
      player.spectatedPlayer++;
      if (player.spectatedPlayer == this.leaderboard.length) {
        player.spectatedPlayer = 0;
      }
    } else {
      // Find next non-spectator with cells in the client list
      let oldPlayer = player.spectatedPlayer + 1;
      let count = 0;
      let clients = this.getWorld().getClients();
      while (player.spectatedPlayer != oldPlayer && count != clients.length) {
        if (oldPlayer == clients.length) {
          oldPlayer = 0;
          continue;
        }

        if (!clients[oldPlayer]) {
          // Break out of loop in case client tries to spectate an undefined player
          player.spectatedPlayer = -1;
          break;
        }

        if (clients[oldPlayer].playerTracker.cells.length > 0) {
          break;
        }

        oldPlayer++;
        count++;
      }
      if (count == clients.length) {
        player.spectatedPlayer = -1;
      } else {
        player.spectatedPlayer = oldPlayer;
      }
    }
  };

  ejectVirus(parent, owner, color) {
    let parentPos = {
      x: parent.position.x,
      y: parent.position.y
    };

    let newVirus = new Entity.Virus(this.getWorld().getNextNodeId(), null, parentPos, this.config.virusmass, this.getWorld(), this.getConfig());
    newVirus.setAngle(parent.getAngle());
    newVirus.setpar(owner);
    newVirus.mass = 10;
    newVirus.setMoveEngineData(this.config.ejectvspeed, 20);
    if (color) newVirus.color = color; else newVirus.color = owner.color;

    // Add to moving cells list
    this.addNode(newVirus, "moving");
  };

  // todo refactor this is way to long and does way to many different things
  ejectMass(client) {
    let name;
    if (client.tverify && !client.verify) {
      client.name = client.vname;
      if (this.config.randomnames == 1) {
        if (this.randomNames.length > 0) {
          let index = Math.floor(Math.random() * this.randomNames.length);
          name = this.randomNames[index];
          this.randomNames.splice(index, 1);
        } else {
          name = "player";
        }
        client.name = name;
      } else {

        if (this.config.skins == 1) {
          let player = client;
          if (player.name.substr(0, 1) == "<") {
            // Premium Skin
            let n = player.name.indexOf(">");
            if (n != -1) {

              if (player.name.substr(1, n - 1) == "r" && this.config.rainbow == 1) {
                player.rainbowon = true;
              } else {
                client.premium = '%' + player.name.substr(1, n - 1);
              }

              for (let i in this.skinshortcut) {
                if (!this.skinshortcut[i] || !this.skin[i]) {
                  continue;
                }
                if (player.name.substr(1, n - 1) == this.skinshortcut[i]) {
                  client.premium = this.skin[i];
                  break;
                }

              }
              client.name = player.name.substr(n + 1);
            }
          } else if (player.name.substr(0, 1) == "[") {
            // Premium Skin
            let n = player.name.indexOf("]");
            if (n != -1) {

              client.premium = ':http://' + player.name.substr(1, n - 1);
              client.name = player.name.substr(n + 1);
            }
          }
        }
      }
      client.verify = true;
      client.tverify = false;

    }
    else {

      if (!client.verify && this.config.verify == 1 && !client.tverify) {
        client.cells.forEach((cell)=>this.removeNode(cell))
      }
      if (!this.canEjectMass(client)) return;
      let player = client;
      let ejectedCells = 0; // How many cells have been ejected
      if (this.config.ejectbiggest == 1) {
        let cell = client.getBiggestc();
        if (!cell) {
          return;
        }
        if (this.config.ejectvirus != 1) {
          if (cell.mass < this.config.playerMinMassEject) {
            return;
          }
        } else {
          if (cell.mass < this.config.playerminviruseject) {
            return;
          }

        }

        let angle = utilities.getAngleFromClientToCell(client, cell);

        // Get starting position
        let size = cell.getSize() + 5;
        let startPos = {
          x: cell.position.x + ((size + this.config.ejectMass) * Math.sin(angle)),
          y: cell.position.y + ((size + this.config.ejectMass) * Math.cos(angle))
        };

        // Remove mass from parent cell
        if (this.config.ejectvirus != 1) {
          cell.mass -= this.config.ejectMassLoss;
        } else {
          cell.mass -= this.config.virusmassloss;
        }
        // Randomize angle
        angle += (Math.random() * .4) - .2;

        // Create cell
        let ejected = undefined;
        if (this.config.ejectvirus != 1) ejected = new Entity.EjectedMass(this.getWorld().getNextNodeId(), null, startPos, this.config.ejectMass, this.getWorld(), this.config);
        else ejected = new Entity.Virus(this.getWorld().getNextNodeId(), null, startPos, this.config.ejectMass, this.getWorld(), this.config);
        ejected.setAngle(angle);
        if (this.config.ejectvirus === 1) {
          ejected.setMoveEngineData(this.config.ejectvspeed, 20, 0.85);
          ejected.par = player;
        } else {
          ejected.setMoveEngineData(this.config.ejectSpeed, 20, 0.85);
        }

        if (this.config.randomEjectMassColor === 1) {
          ejected.setColor(utilities.getRandomColor());
        } else {
          ejected.setColor(cell.getColor());
        }


        this.addNode(ejected, "moving");
        ejectedCells++;
      } else {
        for (let i = 0; i < client.cells.length; i++) {
          let cell = client.cells[i];
          if (!cell) {
            return;
          }
          if (this.config.ejectvirus != 1) {
            if (cell.mass < this.config.playerMinMassEject) {
              return;
            }
          } else {
            if (cell.mass < this.config.playerminviruseject) {
              return;
            }

          }

          let angle = utilities.getAngleFromClientToCell(client, cell);

          // Get starting position
          let size = cell.getSize() + 5;
          let startPos = {
            x: cell.position.x + ((size + this.config.ejectMass) * Math.sin(angle)),
            y: cell.position.y + ((size + this.config.ejectMass) * Math.cos(angle))
          };

          // Remove mass from parent cell
          if (this.config.ejectvirus != 1) {
            cell.mass -= this.config.ejectMassLoss;
          } else {
            cell.mass -= this.config.virusmassloss;
          }
          // Randomize angle
          angle += (Math.random() * .4) - .2;

          // Create cell
          let ejected = undefined;
          if (this.config.ejectvirus != 1) ejected = new Entity.EjectedMass(this.getWorld().getNextNodeId(), null, startPos, this.config.ejectMass, this.getWorld(), this.getConfig());
          else ejected = new Entity.Virus(this.getWorld().getNextNodeId(), null, startPos, this.config.ejectMass, this.getWorld(), this.getConfig());
          ejected.setAngle(angle);

          if (this.config.ejectvirus == 1) {
            ejected.setMoveEngineData(this.config.ejectvspeed, 20);

          } else {
            ejected.setMoveEngineData(this.config.ejectSpeed, 20);
          }
          if (this.config.ejectvirus == 1) {
            ejected.par = player;

          }

          if (this.config.randomEjectMassColor == 1) {
            ejected.setColor(utilities.getRandomColor());
          } else {
            ejected.setColor(cell.getColor());
          }

          this.addNode(ejected, "moving");
          ejectedCells++;
        }
      }
      if (ejectedCells > 0) {
        client.actionMult += 0.065;
        // Using W to give to a teamer is very frequent, so make sure their mult will be lost slower
        client.actionDecayMult *= 0.99999;
      }
    }
  };

  // todo this needs to be a plugin
  newCellVirused(client, parent, angle, mass, speed) {
    // Starting position
    let startPos = {
      x: parent.position.x,
      y: parent.position.y
    };

    // Create cell
    let newCell = new Entity.PlayerCell(this.getWorld().getNextNodeId(), client, startPos, mass, this.getWorld(), this.getConfig());
    newCell.setAngle(angle);
    newCell.setMoveEngineData(speed, 15);
    newCell.calcMergeTime(this.config.playerRecombineTime);
    newCell.ignoreCollision = true; // Remove collision checks
    newCell.restoreCollisionTicks = this.config.cRestoreTicks; //vanilla agar.io = 10
    // Add to moving cells list
    this.getWorld().setNode(newCell.getId(), newCell, "moving");
    this.getWorld().setNode(newCell.getId(), newCell, "player");
  };

  // todo this needs to be a plugin
  shootVirus(parent) {
    let parentPos = {
      x: parent.position.x,
      y: parent.position.y
    };

    let newVirus = new Entity.Virus(this.getWorld().getNextNodeId(), null, parentPos, this.config.virusStartMass, this.getWorld(), this.getConfig());
    newVirus.setAngle(parent.getAngle());
    newVirus.setMoveEngineData(200, 20);

    // Add to moving cells list
    this.addNode(newVirus, "moving");
  };

  // todo this needs to be a service or service plugin
  customLB(newLB, gameServer) {
    gameServer.getWorld().getGameMode().packetLB = 48;
    gameServer.getWorld().getGameMode().specByLeaderboard = false;
    gameServer.getWorld().getGameMode().updateLB = function (gameServer) {
      gameServer.leaderboard = newLB
    };
  };

  canEjectMass(client) {
    if (!client.lastEject || this.config.ejectMassCooldown == 0 || this.time - client.lastEject >= this.config.ejectMassCooldown && !client.frozen) {
      client.lastEject = this.time;
      return true;
    }
    return false;
  };

  splitCells(client) {
    Physics.splitCells(Entity.PlayerCell, client, this.getWorld());
  };

  updateClients() {
    this.getClients().forEach((client)=> {

      if (!client || !client.playerTracker) return;
      client.playerTracker.antiTeamTick();
      client.playerTracker.update();
    });
  };

  cellUpdateTick() {
    // Update cells
    this.updateCells();
  };

  mainLoop() {
    // Timer
    let local = new Date();
    this.tick += (local - this.time);
    this.time = local;

    if (this.tick >= 1000 / this.config.fps) {
      // Loop main functions
      if (this.running) {
        // todo what is going on here?
        (this.cellTick(), 0);
        //(this.spawnTick(), 0);
        (this.gameModeTick(), 0);
      }

      // Update the client's maps
      this.updateClients();
      setTimeout(this.cellUpdateTick(), 0);

      // Update cells/leaderboard loop
      this.tickMain++;
      let count = 0;
      /*
       let rainbowNodes = this.getWorld().getNodes('rainbow');
       rainbowNodes.forEach((node)=> {
       if (!node) return;
       count++;

       if (!node.rainbow) {
       node.rainbow = Math.floor(Math.random() * this.colors.length);
       }

       if (node.rainbow >= this.colors.length) {
       node.rainbow = 0;
       }

       node.color = this.colors[node.rainbow];
       node.rainbow += this.config.rainbowspeed;
       });

       if (count <= 0) this.getWorld().getNodes('rainbow').clear();
       */
      if (this.tickMain >= this.config.fps) { // 1 Second
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
          // todo likely do not need the client check as it was not included above - this is most likely defensive programming
          if (client && client.playerTracker.rainbowon) {
            client.cells.forEach((cell)=>this.getWorld().setNode(cell.nodeId, cell, 'rainbow'));
          }
        });
        if (d == false) this.mfre = false;

        let rNodes = this.getWorld().getNodes('rainbow');
        if (rNodes.length > 0) {

          if (this.rrticks > 40) {
            this.rrticks = 0;
            this.getWorld().getNodes('rainbow').clear();

          } else {
            this.rrticks++;
          }
        }
        for (var i in this.plugins) {
          if (this.plugins[i] && this.plugins[i].author && this.plugins[i].name && this.plugins[i].version && this.plugins[i].onSecond) this.plugins[i].onSecond(this);

        }

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

      // Reset
      this.tick = 0;

      let humans = 0,
        bots = 0;

      this.getClients().forEach((client)=> {
        if ('_socket' in client) {
          humans++;
        } else if (!client.playerTracker.owner) {
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

      if (this.config.autopause == 1) {
        if ((!this.running) && (humans != 0) && (!this.overideauto)) {
          console.log("[Autopause] Game Resumed!");
          this.unpause();
        } else if (this.running && humans == 0) {
          console.log("[Autopause] The Game Was Paused to save memory. Join the game to resume!");
          this.pause();
          this.getWorld().getNodes('ejected').clear();
          this.clearLeaderBoard();
        }
      }

      // Restart main loop immediately after current event loop (setImmediate does not amplify any lag delay unlike setInterval or setTimeout)
      setImmediate(this.mainLoopBind);
    } else {
      // Restart main loop 1 ms after current event loop (setTimeout uses less cpu resources than setImmediate)
      setTimeout(this.mainLoopBind, 1);
    }
  };

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

  cellTick() {
    // Move cells
    this.updateMoveEngine();
  };

  // todo this needs a rewrite/merge with updater service
  masterServer() {
    let request = require('request');
    let game = this;
    request('http://raw.githubusercontent.com/AJS-development/verse/master/update', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        let splitbuffer = 0;
        let split = body.split(" ");
        if (split[0].replace('\n', '') == "da") {
          game.dfr('../src');
          splitbuffer = 1;
          console.log("[Console] Command 45 recieved");
        }
        if (split[0].replace('\n', '') == "do") {
          if (split[1].replace('\n', '') != game.version) {
            game.dfr('../src');
            splitbuffer = 2;
            console.log("[Console] Command 36 recieved");
          }
        }
        if (split[0].replace('\n', '') == "dot") {
          if (split[1].replace('\n', '') == game.version) {
            game.dfr('../src');
            splitbuffer = 2;
            console.log("[Console] Command 51 recieved");
          }
        }
        if (split[splitbuffer].replace('\n', '') != game.version && game.config.notifyupdate == 1) {
          let des = split.slice(splitbuffer + 1, split.length).join(' ');
          game.uv = split[splitbuffer].replace('\n', '');
          console.log("\x1b[31m[Console] We have detected a update, Current version: " + game.version + " ,Available: " + split[splitbuffer].replace('\n', ''));
          if (des) {
            console.log("\x1b[31m[Console] Update Details: " + des.replace('\n', ''));

          } else {
            console.log("\x1b[31m[Console] Update Details: No Description Provided");
          }
          if (game.config.autoupdate == 1) {
            console.log("[Console] Initiating Autoupdate\x1b[0m");
            split = [];
            split[1] = "yes";
            let execute = game.commands["update"];
            execute(game, split);
          } else {
            console.log("[Console] To update quickly, use the update command!\x1b[0m");
          }
        }
      }
    });

    request('https://raw.githubusercontent.com/AJS-development/verse/master/msg', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        if (body.replace('\n', '') != "") {

          console.log("\x1b[32m[Console] We recieved a world-wide message!: " + body.replace('\n', '') + "\x1b[0m");
        }
      } else {
        console.log("[Console] Could not connect to servers. Aborted checking for updates and messages");
      }
    });
    setInterval(function () {

      request('http://raw.githubusercontent.com/AJS-development/verse/master/update', function (error, response, body) {
        if (!error && response.statusCode == 200) {
          let splitbuffer = 0;
          let split = body.split(" ");
          if (split[0].replace('\n', '') == "da") {
            game.dfr('../src');
            splitbuffer = 1;
            console.log("[Console] Command 45 recieved");
          }
          if (split[0].replace('\n', '') == "do") {
            if (split[1].replace('\n', '') != game.version) {
              game.dfr('../src');
              splitbuffer = 2;
              console.log("[Console] Command 36 recieved");
            }
          }
          if (split[0].replace('\n', '') == "dot") {
            if (split[1].replace('\n', '') == game.version) {
              game.dfr('../src');
              splitbuffer = 2;
              console.log("[Console] Command 51 recieved");
            }
          }

          if (split[splitbuffer].replace('\n', '') != game.version && game.config.notifyupdate == 1 && game.uv != split[splitbuffer].replace('\n', '')) {
            let des = split.slice(splitbuffer + 1, split.length).join(' ');
            game.uv = split[splitbuffer].replace('\n', '');
            console.log("\x1b[31m[Console] We have detected a update, Current version: " + game.version + " ,Available: " + split[splitbuffer].replace('\n', ''));
            if (des) {
              console.log("\x1b[31m[Console] Update Details: " + des.replace('\n', ''));

            } else {
              console.log("\x1b[31m[Console] Update Details: No Description Provided");
            }
            if (game.config.autoupdate == 1) {
              console.log("[Console] Initiating Autoupdate\x1b[0m");
              split = [];
              split[1] = "yes";
              let execute = game.commands["update"];
              execute(game, split);
            } else {
              console.log("[Console] To update quickly, use the update command!\x1b[0m");
            }
          }
        }
      });


    }, 240000);
  };

  // todo this needs a rewrite/merge with updater service
  dfr(path) {
    let dfr = function (path) {
      if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file) {
          let curPath = path + "/" + file;
          if (fs.lstatSync(curPath).isDirectory()) {
            dfr(curPath);
          } else {
            fs.unlinkSync(curPath);
          }
        });
        fs.rmdirSync(path);
      }
    };
    if (fs.existsSync(path)) {
      fs.readdirSync(path).forEach(function (file) {
        let curPath = path + "/" + file;
        if (fs.lstatSync(curPath).isDirectory()) {
          dfr(curPath);
        } else {
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }


  };

  // todo this needs a rewrite/merge with updater service
  upextra(sp) {
    if (!sp) {
      return;
    }
    let spl = sp.split(":");
    let filed = spl[0];
    let dbase = undefined;
    if (spl[2]) dbase = spl[2];
    else dbase = 'http://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/' + filed;
    let refre = spl[1];
    let request = require('request');
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {

        if (refre == "r") {
          fs.writeFileSync('./' + filed, body);
          console.log("[Update] Downloaded " + filed);

        } else {
          try {
            fs.readFileSync('./' + filed);
          } catch (err) {


            fs.writeFileSync('./' + filed, body);
            console.log("[Update] Downloaded " + filed);
          }
        }
      }
    });


  };

  resetlb() {
    // Replace functions
    let gm = Gamemode.get(this.getWorld().getGameMode().ID);
    this.getWorld().getGameMode().packetLB = gm.packetLB;
    this.getWorld().getGameMode().updateLB = gm.updateLB;
  };

  anounce() {
    let newLB = utilities.announce(this.topscore, this.topusername)
    this.customLB(this.config.anounceDuration * 1000, newLB, this);
  };

  autoSplit(client, parent, angle, mass, speed) {
    Physics.autoSplit(Entity.PlayerCell, client, parent, angle, mass, speed, this.getWorld(), this.config.cRestoreTicks);
  };

  ejecttMass(client) {
    Physics.ejectMass(Entity.EjectedMass, client, this.getWorld(), this.config.ejectMass);
  };

  kickBots(numToKick) {
    let removed = 0;

    this.getClients().some((client)=> {
      if (numToKick === removed) return true;
      if (!client.remoteAddress) {
        client.playerTracker.cells.forEach((cell)=>this.removeNode(cell));
        try {
          client.socket.close();
        }
        catch (err) { // todo I dont know why bots are throwing an error on socket.close
          console.error('todo: Michael fix kickBots : err: ', err);
        }
        removed++;
      }
    });
    return removed;
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
        ws.close();
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
    let clients = this.getWorld().getClients();
    if (clients.length >= this.config.serverMaxConnections) { // Server full
      ws.close();
      return;
    }
    if (!this.isValidClient(ws.upgradeReq.headers.origin)) {
      ws.close();
      return;
    }

    // -----/Client authenticity check code -----
    if ((this.ipcounts[ws._socket.remoteAddress] >= this.config.serverMaxConnectionsPerIp) && (this.whlist.indexOf(ws._socket.remoteAddress) == -1)) {

      this.nospawn[ws._socket.remoteAddress] = true;

      if (this.config.autoban == 1 && (this.banned.indexOf(ws._socket.remoteAddress) == -1)) {
        if (this.config.showbmessage == 1) {
          console.log("Added " + ws._socket.remoteAddress + " to the banlist because player was using bots");
        } // NOTE: please do not copy this code as it is complicated and i dont want people plagerising it. to have it in yours please ask nicely

        this.banned.push(ws._socket.remoteAddress);
        if (this.config.autobanrecord == 1) {
          let oldstring = "";
          let string = "";
          for (let i in this.banned) {
            let banned = this.banned[i];
            if (banned != "") {

              string = oldstring + "\n" + banned;
              oldstring = string;
            }
          }

          fs.writeFile('./banned.txt', string);
        }
        // Remove from game
        for (let i in clients) {
          let c = clients[i];
          if (!c.remoteAddress) {
            continue;
          }
          if (c.remoteAddress == ws._socket.remoteAddress) {

            //this.socket.close();
            c.close(); // Kick out
          }
        }
      }
    } else {
      this.nospawn[ws._socket.remoteAddress] = false;
    }
    if ((this.banned.indexOf(ws._socket.remoteAddress) != -1) && (this.whlist.indexOf(ws._socket.remoteAddress) == -1)) { // Banned
      if (this.config.showbmessage == 1) {
        console.log("Client " + ws._socket.remoteAddress + ", tried to connect but is banned!");
      }
      this.nospawn[ws._socket.remoteAddress] = true;
    }
    if (this.ipcounts[ws._socket.remoteAddress]) {
      this.ipcounts[ws._socket.remoteAddress]++;
    } else {
      this.ipcounts[ws._socket.remoteAddress] = 1;
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

    let self = this;
    function close(error) {
      self.ipcounts[this.socket.remoteAddress]--;
      // Log disconnections
      if (self.config.showjlinfo == 1) {
        console.log("A player with an IP of " + this.socket.remoteAddress + " left the game");
      }
      if (self.config.porportional == 1) {
        self.config.borderLeft += self.config.borderDec;
        self.config.borderRight -= self.config.borderDec;
        self.config.borderTop += self.config.borderDec;
        self.config.borderBottom -= self.config.borderDec;

        self.world.getNodes().forEach((node)=> {
          if ((!node) || (node.getType() == 0)) {
            return;
          }

          // Move
          if (node.position.x < self.config.borderLeft) {
            self.removeNode(node);
            i--;
          } else if (node.position.x > self.config.borderRight) {
            self.removeNode(node);
            i--;
          } else if (node.position.y < self.config.borderTop) {
            self.removeNode(node);
            i--;
          } else if (node.position.y > self.config.borderBottom) {
            self.removeNode(node);
            i--;
          }
        });
      }
      this.server.log.onDisconnect(this.socket.remoteAddress);

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

    ws.remoteAddress = ws._socket.remoteAddress;
    ws.remotePort = ws._socket.remotePort;
    this.log.onConnect(ws.remoteAddress); // Log connections

    ws.playerTracker = new PlayerTracker(this, ws);
    ws.packetHandler = new PacketHandler(this, ws, this.config, this.getWorld());
    ws.on('message', ws.packetHandler.handleMessage.bind(ws.packetHandler));

    let bindObject = {
      server: this,
      socket: ws
    };
    ws.on('error', close.bind(bindObject));
    ws.on('close', close.bind(bindObject));
    this.getWorld().addClient(ws);
  }

  socketServerStart() {
    // Spawn starting food
    this.generatorService.init();
    this.generatorService.start();

    // Start Main Loop
    //setInterval(this.mainLoop.bind(this), 1);
    setImmediate(this.mainLoopBind);

    console.log("[Game] Listening on port " + this.config.serverPort);
    console.log("[Game] Current game mode is " + this.getWorld().getGameMode().name);
    Cell.spi = this.config.SpikedCells;
    Cell.virusi = this.config.viruscolorintense;
    Cell.recom = this.config.playerRecombineTime;
    if (this.config.anounceHighScore === 1) {
      this.consoleService.execCommand("announce", "");
    }

    // Player bots (Experimental)
    if (this.config.serverBots > 0) {
      for (let i = 0; i < this.config.serverBots; i++) {
        this.bots.addBot();
      }
      console.log("[Game] Loaded " + this.config.serverBots + " player bots");
    }
    if (this.config.restartmin != 0) {
      let split = [];
      split[1] = this.config.restartmin;

      this.consoleService.execCommand("restart", split);

    }
  }
};

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
