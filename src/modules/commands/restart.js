var GameMode = require('../../gamemodes');

module.exports = function (gameServer, split) {
  var time = split[1];
  if (isNaN(time) || time < 1) {

    console.log("\x1b[0m[Console] Restarting server...");
    gameServer.socketServer.close();
    process.exit(3);
  } else {
    console.log("Server Restarting in " + time + " minutes!");
    setTimeout(function () {
      var newLB = [];
      newLB[0] = "Server Restarting";
      newLB[1] = "In 1 Minute";
      this.lleaderboard = false;

      // Clears the update leaderboard function and replaces it with our own
      gameServer.getWorld().getGameMode().packetLB = 48;
      gameServer.getWorld().getGameMode().specByLeaderboard = false;
      gameServer.getWorld().getGameMode().updateLB = function (gameServer) {
        gameServer.leaderboard = newLB
      };
      console.log("The Server is Restarting in 1 Minute");
      setTimeout(function () {
        var gm = GameMode.get(gameServer.getWorld().getGameMode().ID);

        // Replace functions
        gameServer.getWorld().getGameMode().packetLB = gm.packetLB;
        gameServer.getWorld().getGameMode().updateLB = gm.updateLB;
        setTimeout(function () {
          gameServer.lleaderboard = true;
        }, 2000);
      }, 14000);

      setTimeout(function () {
        console.log("\x1b[0m[Console] Restarting server...");
        gameServer.socketServer.close();
        process.exit(3);
      }, 60000);
    }, (time * 60000) - 60000);

  }
};
