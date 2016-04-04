var GameMode = require('../../gamemodes');

module.exports = function (gameServer, split) {
  var newLB = [];
  for (var i = 1; i < split.length; i++) {
    newLB[i - 1] = split[i];
  }

  // Clears the update leaderboard function and replaces it with our own
  gameServer.lleaderboard = false;
  gameServer.getWorld().getGameMode().packetLB = 48;
  gameServer.getWorld().getGameMode().specByLeaderboard = false;
  gameServer.getWorld().getGameMode().updateLB = function (gameServer) {
    gameServer.leaderboard = newLB
  };
  console.log("[Console] Successfully changed leaderboard values");
};
