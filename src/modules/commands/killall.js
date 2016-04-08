'use strict';
module.exports = function (gameServer, split) {
  let count = 0;
  gameServer.getPlayerNodes().forEach((node)=> {
    gameServer.removeNode(node);
    count++;
  });
  console.log("[Console] Removed " + count + " cells");
};
