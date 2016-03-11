module.exports = function (gameServer, split) {
  for (var j = 0; j < 10; j++) {
    for (var i in gameServer.nodes) {
      gameServer.removeNode(gameServer.nodes[i]);
    }
  }
  console.log("[Console] Reseted game");
};
