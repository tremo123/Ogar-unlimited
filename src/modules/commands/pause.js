module.exports = function (gameServer, split) {
  gameServer.run = !gameServer.run; // Switches the pause state
  if (!gameServer.run) {
    gameServer.overideauto = true;
  } else {
    gameServer.overideauto = false;
  }

  var s = gameServer.run ? "Unpaused" : "Paused";
  console.log("[Console] " + s + " the game.");
};
