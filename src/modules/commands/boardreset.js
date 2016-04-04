var GameMode = require('../../gamemodes');

module.exports = function (gameServer) {
  // Gets the current gamemode
  var gm = GameMode.get(gameServer.getWorld().getGameMode().ID);

  // Replace functions
  gameServer.getWorld().getGameMode().packetLB = gm.packetLB;
  gameServer.getWorld().getGameMode().updateLB = gm.updateLB;
  console.log("[Console] Successfully reset leaderboard");
  setTimeout(function () {
    gameServer.lleaderboard = true;
  }, 2000);
};
