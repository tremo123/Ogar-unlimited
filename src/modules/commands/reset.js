'use strict';
// todo this needs review
module.exports = function (gameServer, split) {
  let nodes = gameServer._nodes;
  for (var j = 0; j < 10; j++) {
    for (var i in nodes) {
      gameServer.removeNode(nodes[i]);
    }
  }
  console.log("[Console] Reset the game");
};
