module.exports = function (gameServer, args) {
  var add = parseInt(args[1]);
  if (isNaN(add)) {
    add = 1; // Adds 1 bot if user doesnt specify a number
  }
  gameServer.livestage = 2;
  gameServer.liveticks = 0;
  for (var i = 0; i < add; i++) {
    gameServer.bots.addBot();
    // todo encapsulation
    gameServer.sbo++;
  }
  console.log("[Console] Added " + add + " player bots");
};
