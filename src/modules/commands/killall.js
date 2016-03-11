module.exports = function (gameServer, split) {
  var count = 0;
  var len = gameServer.nodesPlayer.length;
  for (var i = 0; i < len; i++) {
    gameServer.removeNode(gameServer.nodesPlayer[0]);
    count++;
  }
  console.log("[Console] Removed " + count + " cells");
};
