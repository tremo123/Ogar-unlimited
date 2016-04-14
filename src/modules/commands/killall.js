'use strict';
module.exports = function (gameServer, split) {
  let count = 0;
   gameServer.getWorld().getNodes('player').forEach((node)=> {
    gameServer.removeNode(node);
     if (node) count++;
  });
   console.log("[Console] Removed " + count + " cells");
};
