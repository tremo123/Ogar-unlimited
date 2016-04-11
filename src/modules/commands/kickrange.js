module.exports = function (gameServer, split) {
  var start = parseInt(split[1]);
  var end = parseInt(split[2]);
  if (isNaN(start) || isNaN(end)) {
    console.log("[Console] Please specify a valid range!");
  }
  for (var h = start; h < end; h++) {
    for (var i in gameServer.clients) {
      if (gameServer.clients[i].playerTracker.pID == h) {
        var client = gameServer.clients[i].playerTracker;
        var len = client.cells.length;
        for (var j = 0; j < len; j++) {
          gameServer.removeNode(client.cells[0]);
        }
        client.socket.close();
        if (!gameServer.clients[i].remoteAddress) {
          gameServer.sbo --;
          
        }
        
        console.log("[Console] Kicked " + client.name);
        break;
      }
    }
  }
};
