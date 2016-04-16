'use strict';
module.exports = function (gameServer, split) {
  let count = 0;
   for (var i in gameServer.clients) {
     var client = gameServer.clients[i];
     client.playerTracker.cells.forEach((cell)=>{
         gameServer.removeNode(cell);
         count++;
         
     }
         );
   }
   console.log("[Console] Removed " + count + " cells");
};
