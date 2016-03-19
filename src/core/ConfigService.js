'use strict';
module.exports = class ConfigService {
  constructor() {
    this.config = { // Border - Right: X increases, Down: Y increases (as of 2015-05-20)
      autoban: 0, // Auto bans a player if they are cheating
      randomEjectMassColor: 0, // 0 = off 1 = on
      ffaTimeLimit: 60, // TFFA time
      ffaMaxLB: 10, // Max leaderboard slots
      showtopscore: 0, // Shows top score (1 to enable)
      anounceDelay: 70, // Announce delay
      anounceDuration: 8, // How long the announce lasts
      vps: 0,
      ejectantispeed: 120, // Speed of ejected anti matter
      maxopvirus: 60, // Maximum amount of OP viruses
      skins: 1,
      virusmass: 15,
      virusmassloss: 18,
      ejectvirus: 0,
      playerminviruseject: 34,
      minionupdate: 10,
      splitversion: 1,
      verify: 0,
      autobanrecord: 0,
      serverScrambleMinimaps: 1,
      vchance: 5,
      viruscolorintense: 255,
      SpikedCells: 0, // Amount of spiked cells
      autopause: 1, // Auto pauses the game when there are no players (0 to turn off)
      smartbthome: 1, // Automatically sends you back to normal mode after pressing Q proceding an action (default) 2 = off (you need to press Q a lot)
      restartmin: 0, // minutes to restart
      showopactions: 0, // Notifys you of an OP using his power, (0 = Off [default]) 1 = on
      cRestoreTicks: 10, // Amount of time until the collision retores
      showbmessage: 0, // Notifys you if a banned player tried to join (0 = off [default]) 1 = on
      splitSpeed: 130, // Splitting speed
      showjlinfo: 0, // Notifys you if a player has left or joined (0 = off [default]) 1 = on
      ejectvspeed: 120, // How far an ejected virus (from w) shoots
      serverMaxConnectionsPerIp: 5, // Maximum amount of IPs per player connection
      serverMaxConnections: 64, // Maximum amount of connections to the server.
      serverPort: 443, // Server port
      botrespawn: 1,
      rainbow: 1,
      fps: 20,
      highscore: 1,
      rainbowspeed: 1,
      botupdate: 10,
      notifyupdate: 1,
      botrealnames: 0,
      smartbotspawn: 0,
      smartbspawnbase: 20,
      autoupdate: 0,
      minionavoid: 1,
      mousefilter: 1,
      borderDec: 200,
      kickspectate: 0,
      ejectbiggest: 0,
      porportional: 0,
      customskins: 1,
      botmaxsplit: 4,
      serverGamemode: 0, // Gamemode, 0 = FFA, 1 = Teams
      serverBots: 0, // Amount of player bots to spawn
      serverViewBaseX: 1024, // Base view distance of players. Warning: high values may cause lag
      serverViewBaseY: 592, // Same thing as line 77
      serverStatsPort: 88, // Port for stats server. Having a negative number will disable the stats server.
      serverStatsUpdate: 60, // Amount of seconds per update for the server stats
      serverLogLevel: 1, // Logging level of the server. 0 = No logs, 1 = Logs the console, 2 = Logs console and ip connections
      serverScrambleCoords: 1, // Toggles scrambling of coordinates. 0 = No scrambling, 1 = scrambling. Default is 1.
      borderLeft: 0, // Left border of map (Vanilla value: 0)
      borderRight: 6000, // Right border of map (Vanilla value: 11180.3398875)
      borderTop: 0, // Top border of map (Vanilla value: 0)
      borderBottom: 6000, // Bottom border of map (Vanilla value: 11180.3398875)
      liveConsole: 0, // Easiest way to get stats (1 to enable)
      anounceHighScore: 0, // Announces highscore (1 to enable)
      spawnInterval: 20, // The interval between each food cell spawn in ticks (1 tick = 50 ms)
      foodSpawnAmount: 10, // The amount of food to spawn per interval
      foodStartAmount: 100, // The starting amount of food in the map
      foodMaxAmount: 500, // Maximum food cells on the map
      foodMass: 1, // Starting food size (In mass)
      teaming: 1, // teaming or anti teaming
      foodMassGrow: 0, // Enable food mass grow ?
      playerFastDecay: 0,
      fastdecayrequire: 5000,
      FDmultiplyer: 5,
      antimatter: 1,
      merge: 1,
      mbchance: 5,
      virus: 1,
      vtime: 20,
      clientclone: 0,
      mass: 1,
      killvirus: 1,
      kickvirus: 1,
      randomnames: 0,
      trollvirus: 1,
      explodevirus: 1,
      foodMassGrowPossiblity: 50, // Chance for a food to has the ability to be self growing
      foodMassLimit: 5, // Maximum mass for a food can grow
      foodMassTimeout: 120, // The amount of interval for a food to grow its mass (in seconds)
      virusMinAmount: 10, // Minimum amount of viruses on the map.
      virusMaxAmount: 50, // Maximum amount of viruses on the map. If this amount is reached, then ejected cells will pass through viruses.
      virusStartMass: 100, // Starting virus size (In mass)
      virusFeedAmount: 7, // Amount of times you need to feed a virus to shoot it
      motherCellMassProtection: 1, // Stopping mothercells from being too big (0 to disable)
      motherCellMaxMass: 10000, // Max mass of a mothercell
      ejectMass: 12, // Mass of ejected cells
      ejectMassCooldown: 200, // Time until a player can eject mass again
      ejectMassLoss: 16, // Mass lost when ejecting cells
      ejectSpeed: 160, // Base speed of ejected cells
      massAbsorbedPercent: 100, // Fraction of player cell's mass gained upon eating
      ejectSpawnPlayer: 50, // Chance for a player to spawn from ejected mass
      playerStartMass: 10, // Starting mass of the player cell.
      playerMaxMass: 22500, // Maximum mass a player can have
      playerMinMassEject: 32, // Mass required to eject a cell
      playerMinMassSplit: 36, // Mass required to split
      playerMaxCells: 16, // Max cells the player is allowed to have
      playerRecombineTime: 30, // Base amount of seconds before a cell is allowed to recombine
      playerMassDecayRate: .002, // Amount of mass lost per second
      playerMinMassDecay: 9, // Minimum mass for decay to occur
      playerMaxNickLength: 15, // Maximum nick length
      playerSpeed: 30, // Player base speed
      playerDisconnectTime: 60, // The amount of seconds it takes for a player cell to be removed after disconnection (If set to -1, cells are never removed)
      tourneyMaxPlayers: 12, // Maximum amount of participants for tournament style game modes
      tourneyPrepTime: 10, // Amount of ticks to wait after all players are ready (1 tick = 1000 ms)
      tourneyEndTime: 30, // Amount of ticks to wait after a player wins (1 tick = 1000 ms)
      tourneyTimeLimit: 20, // Time limit of the game, in minutes.
      tourneyAutoFill: 0, // If set to a value higher than 0, the tournament match will automatically fill up with bots after this amount of seconds
      tourneyAutoFillPlayers: 1, // The timer for filling the server with bots will not count down unless there is this amount of real players
      playerBotGrowEnabled: 1, // If 0, eating a cell with less than 17 mass while cell has over 625 wont gain any mass
    }; // end of this.config
  }
  getConfig() {
    return this.config;
  }
};
