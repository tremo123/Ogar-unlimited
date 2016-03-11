module.exports = function (gameServer) {
  gameServer.loadConfig();

  var loadskins = fs.readFileSync("./customskins.txt", "utf8").split(/[\r\n]+/).filter(function (x) {
    return x != ''; // filter empty names
  });

  for (var i in loadskins) {
    var custom = loadskins[i].split(" ");
    gameServer.skinshortcut[i] = custom[0];
    gameServer.skin[i] = custom[1];
  }
  console.log("[Console] Reloaded the config file successfully");
};
