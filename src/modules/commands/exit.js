module.exports = function (gameServer, split) {

  console.log("\x1b[0m[Console] Closing server...");
  // todo we likely done need this: gameServer.socketServer.close();
  process.exit(1);
};
