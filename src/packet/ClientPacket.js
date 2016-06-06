function ClientPacket(gameServer) {
  this.gameServer = gameServer;
}

module.exports = ClientPacket;

ClientPacket.prototype.build = function() {
  
  var send = { // Levels of "permission": 0 = not allowed, 1 = checked off but changeable, 2 = checked on but changeable, 3 = always on
    sMacro: 0,
    wMacro: 0,
    qMacro: 0,
    eMacro: 0,
    rMacro: 0,
    
    darkBG: 1,
    chat: 2,
    skins: 2,
    grid: 2,
    acid: 1,
    colors: 2,
    names: 2,
    showMass: 1,
    smooth: 1,
    
    minionCount: 0,
    minimap: 0,
    
  };
  
  
};
