var GameMode = require('../../gamemodes');

module.exports = function (gameServer, split) {
  console.log("High Score announce system started");
  setInterval(function () {
    var topScore = Math.floor(gameServer.topscore) + " ";
    var oldTopScores = Math.floor(gameServer.oldtopscores.score) + " ";
    var newLB = [];
    newLB[0] = "Highscore:";
    newLB[1] = gameServer.topusername;
    newLB[2] = "Withscore:";
    newLB[3] = topScore;
    newLB[4] = "------------";
    newLB[6] = "Previous Top Score";
    newLB[7] = oldTopScores;
    newLB[8] = "By:";
    newLB[9] = gameServer.oldtopscores.name;
    gameServer.lleaderboard = false;
    gameServer.getWorld().getGameMode().packetLB = 48;
    gameServer.getWorld().getGameMode().specByLeaderboard = false;
    gameServer.getWorld().getGameMode().updateLB = function (gameServer) {
      gameServer.leaderboard = newLB;
    };
    console.log("[Console] Successfully set leaderboard");
    setTimeout(function () {
      var gm = GameMode.get(gameServer.getWorld().getGameMode().ID);

      // Replace functions
      gameServer.getWorld().getGameMode().packetLB = gm.packetLB;
      gameServer.getWorld().getGameMode().updateLB = gm.updateLB;

      setTimeout(function () {
        gameServer.lleaderboard = true;
      }, 2000);
      console.log("[Console] Successfully reset leaderboard");

    }, gameServer.config.anounceDuration * 1000);

  }, gameServer.config.anounceDelay * 1000);
};
