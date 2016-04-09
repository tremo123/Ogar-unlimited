'use strict';
module.exports = function (gameServer, args) {
  switch (args[1]) {
    case 'dumpNode':
          console.log(gameServer.getWorld().getNode(parseInt(args[2])));
          break;
    default:
          console.log('Unknown command.')
  }
};
