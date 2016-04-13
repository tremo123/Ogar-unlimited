'use strict';
module.exports = function (gameServer, split) {
var count = 0;
    var len = gameServer.getWorld().getNodes('player').length;
    var nodes = gameServer.getWorld().getNodes('player')
    for (var i = 0; i < len; i++) {
      gameServer.removeNode(nodes[i]);
      count++;
    }
    console.log("[Console] Removed " + count + " cells");
};
