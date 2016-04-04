var GameMode = require('../../gamemodes');

module.exports = function (gameServer, split) {
  var newLB = [];
  var n = [];
  gameServer.overideauto = true;
  gameServer.run = false; // Switches the pause state

  for (var i = 1; i < split.length; i++) {
    newLB[i - 1] = split[i];
  }
  for (var i = 0; i < gameServer.clients.length; i++) {
    var client = gameServer.clients[i].playerTracker;
    n[i] = client.name;

    if (client.pID == i + 1) {
      client.name = "Look At Leaderboard";
    }

  }
  gameServer.lleaderboard = false;
  gameServer.getWorld().getGameMode().packetLB = 48;
  gameServer.getWorld().getGameMode().specByLeaderboard = false;
  gameServer.getWorld().getGameMode().updateLB = function (gameServer) {
    gameServer.leaderboard = newLB
  };
  console.log("[ForceMSG] The message has been broadcast");
  setTimeout(function () {
    var gm = GameMode.get(gameServer.getWorld().getGameMode().ID);

    // Replace functions
    gameServer.getWorld().getGameMode().packetLB = gm.packetLB;
    gameServer.getWorld().getGameMode().updateLB = gm.updateLB;

    for (var i = 0; i < gameServer.clients.length; i++) {
      var client = gameServer.clients[i].playerTracker;

      if (client.pID == i + 1) {
        client.name = n[i];
      }

    }
    gameServer.overideauto = false;
    gameServer.run = true;
    console.log("[ForceMSG] The game has been reset");
    setTimeout(function () {
      gameServer.lleaderboard = true;
    }, 2000);
  }, 6500);
};
