'use strict';

module.exports = function (gameServer, args) {
  switch (args[1]){
    case 'hashFiles':
          gameServer.updater.hashFiles();
          break;
    default:
          console.log('Unknown command.');
  }
};
