'use strict';
module.exports = function (gameServer, split) {
var count = 0;
    var len = gameServer._nodesPlayer.length;
    for (var i = 0; i < len; i++) {
      gameServer.removeNode(gameServer._nodesPlayer[i]);
      if (gameServer._nodesPlayer[i]) count++;
    }
    gameServer._nodesPlayer = [];
    console.log("[Console] Removed " + count + " cells");
};
