'use strict';
module.exports = function (gameServer, split) {
  let borderDec = split[1];
  if (isNaN(borderDec)) {
    borderDec = 200;
  }
  gameServer.config.borderLeft += borderDec;
  gameServer.config.borderRight -= borderDec;
  gameServer.config.borderTop += borderDec;
  gameServer.config.borderBottom -= borderDec;

  let nodes = gameServer.getNodes();
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];

    if ((!node) || (node.getType() == 0)) {
      continue;
    }

    // Move
    if (node.position.x < gameServer.config.borderLeft) {
      gameServer.removeNode(node);
      i--;
    } else if (node.position.x > gameServer.config.borderRight) {
      gameServer.removeNode(node);
      i--;
    } else if (node.position.y < gameServer.config.borderTop) {
      gameServer.removeNode(node);
      i--;
    } else if (node.position.y > gameServer.config.borderBottom) {
      gameServer.removeNode(node);
      i--;
    }
  }
  console.log("[Console] Successivly shrinked game. Size: " + (gameServer.config.borderRight - gameServer.config.borderLeft) + "," + (gameServer.config.borderBottom - gameServer.config.borderTop));

};
