var GameMode = require('../../gamemodes');

module.exports = function (gameServer, split) {
  try {
    var n = parseInt(split[1]);
    var gm = GameMode.get(n); // If there is an invalid gamemode, the function will exit
    gameServer.getWorld().getGameMode().onChange(gameServer); // Reverts the changes of the old gamemode
    gameServer.getWorld().changeGameMode(gm); // Apply new gamemode
    gameServer.getWorld().getGameMode().onServerInit(gameServer); // Resets the server
    console.log("[Game] Changed game mode to " + gameServer.getWorld().getGameMode().name);
  } catch (e) {
    console.log("[Console] Invalid game mode selected");
  }
};
