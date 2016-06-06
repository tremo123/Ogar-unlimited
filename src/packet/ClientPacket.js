function ClientPacket(gameServer) {
  this.gameServer = gameServer;
}

module.exports = ClientPacket;

ClientPacket.prototype.build = function() {
  // this is an upcoming feature where the game can edit the client
  var send = { // Levels of "permission": 0 = not allowed, 1 = checked off but changeable, 2 = checked on but changeable, 3 = always on
   
   // Macros
    sMacro: 0,
    wMacro: 0,
    qMacro: 0,
    eMacro: 0,
    rMacro: 0,
    
    // Current client configs
    darkBG: 1,
    chat: 2,
    skins: 2,
    grid: 2,
    acid: 1,
    colors: 2,
    names: 2,
    showMass: 1,
    smooth: 1,
    
    // Future feature
    minionCount: 0,
    minimap: 0,
    
    // Others
    maxName: 15,
  };
  var toSend = JSON.stringify(send);
  
  var b = toSend.length + 2;
 var buf = new ArrayBuffer(b);
  var view = new DataView(buf);
view.setUint8(0, 70);
var offset = 1;
  if (toSend) {
    for (var j = 0; j < toSend.length; j++) {
        var c = toSend.charCodeAt(j);
        if (c) {
         view.setUint8(offset, c, true);
        }
        offset ++;
    }
  }
   view.setUint8(offset, 0, true); // End of string
    offset ++;
    return buf;
};
