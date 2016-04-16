'use strict';
module.exports = function (gameServer, split) {
  let count = 0;
   for (var i in gameServer.clients) {
     client = gameServer.clients[i];
     for (var j in client.cells) {
       
       gameServer.removeNode(client.cells[i])
       count ++
     }
     
   }
   console.log("[Console] Removed " + count + " cells");
};
