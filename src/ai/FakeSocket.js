// A fake socket for bot players

function FakeSocket(world) {
  this.world = world;
}
module.exports = FakeSocket;

// Overrides
FakeSocket.prototype.sendPacket = function (packet) {
  // Fakes sending a packet
};

FakeSocket.prototype.close = function (error) {
  // Removes the bot
  var len = this.playerTracker.cells.length;
  for (var i = 0; i < len; i++) {
    var cell = this.playerTracker.cells[0];
    if (!cell) {
      continue;
    }
    this.world.removeNode(cell);
  }
  this.world.removeClient(this);

};
