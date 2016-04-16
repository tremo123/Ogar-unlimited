'use strict';
module.exports = function (gameServer, split) {
  let count = 0;
   for (var i in gameServer.clients) {
     client = gameServer.clients[i];
     client.cells.forEach((cell)=>gameServer.removeNode(cell));
     
   }
   console.log("[Console] Removed " + count + " cells");
};
