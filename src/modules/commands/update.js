// todo @Michael done - need to rewrite this function as there is a lot of repeated code that could be refactored / dry
// todo done - should be a list of files that is handled by a generic function, no need to write the same code for each file
// todo next need to move the file list out into a json file
// todo next add hashing so we only have to download files that are newer
// todo next refactor this to use promises/waterfall or something alone that lines

var fs = require("fs");
var request = require('request');
var url = "http://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/";
let fileList = [
  {name: "botnames", src: "botnames.txt", dst: "./botnames.txt"},
  {name: "realisticnames", src: "realisticnames.txt", dst: "./realisticnames.txt"},
  {name: "customskins", src: "customskins.txt", dst: "./customskins.txt"},
  {name: "GameServer", src: "GameServer.js", dst: "./GameServer.js"},
  {name: "PlayerTracker", src: "PlayerTracker.js", dst: "./PlayerTracker.js"},
  {name: "PacketHandler", src: "PacketHandler.js", dst: "./PacketHandler.js"},
  {name: "gameserver", src: "gameserver.ini", dst: "./gameserver.ini"},
  {name: "packet:AddNode", src: "packet/AddNode.js", dst: "./packet/AddNode.js"},
  {name: "packet:ClearNodes", src: "packet/ClearNodes.js", dst: "./packet/ClearNodes.js"},
  {name: "packet:UpdateLeaderboard", src: "packet/UpdateLeaderboard.js", dst: "./packet/UpdateLeaderboard.js"},
  {name: "packet:UpdateNodes", src: "packet/UpdateNodes.js", dst: "./packet/UpdateNodes.js"},
  {name: "packet:index", src: "packet/index.js", dst: "./packet/index.js"},
  {name: "ai:BotLoader", src: "ai/BotLoader.js", dst: "./ai/BotLoader.js"},
  {name: "ai:BotPlayer", src: "ai/BotPlayer.js", dst: "./ai/BotPlayer.js"},
  {name: "ai:MinionLoader", src: "ai/MinionLoader.js", dst: "./ai/MinionLoader.js"},
  {name: "ai:MinionPlayer", src: "ai/MinionPlayer.js", dst: "./ai/MinionPlayer.js"},
  {name: "ai:MinionSocket", src: "ai/MinionSocket.js", dst: "./ai/MinionSocket.js"},
  {name: "ai:FakeSocket", src: "ai/FakeSocket.js", dst: "./ai/FakeSocket.js"},
  {name: "ai:Readme", src: "ai/Readme.js", dst: "./ai/Readme.js"},
  {name: "entity:Beacon", src: "entity/Beacon.js", dst: "./entity/Beacon.js"},
  {name: "entity:Cell", src: "entity/Cell.js", dst: "./entity/Cell.js"},
  {name: "entity:EjectedMass", src: "entity/EjectedMass.js", dst: "./entity/EjectedMass.js"},
  {name: "entity:Food", src: "entity/Food.js", dst: "./entity/Food.js"},
  {name: "entity:MotherCell", src: "entity/MotherCell.js", dst: "./entity/MotherCell.js"},
  {name: "entity:MovingVirus", src: "entity/MovingVirus.js", dst: "./entity/MovingVirus.js"},
  {name: "entity:PlayerCell", src: "entity/PlayerCell.js", dst: "./entity/PlayerCell.js"},
  {name: "entity:StickyCell", src: "entity/StickyCell.js", dst: "./entity/StickyCell.js"},
  {name: "entity:Virus", src: "entity/Virus.js", dst: "./entity/Virus.js"},
  {name: "entity:index", src: "entity/index.js", dst: "./entity/index.js"},
  {name: "gamemodes:BlackHole", src: "gamemodes/BlackHole.js", dst: "./gamemodes/BlackHole.js"},
  {name: "gamemodes:Debug", src: "gamemodes/Debug.js", dst: "./gamemodes/Debug.js"},
  {name: "gamemodes:Experimental v2", src: "gamemodes/Experimental%20v2.js", dst: "./gamemodes/Experimental v2.js"},
  {name: "gamemodes:Experimental", src: "gamemodes/Experimental.js", dst: "./gamemodes/Experimental.js"},
  {name: "gamemodes:FFA", src: "gamemodes/FFA.js", dst: "./gamemodes/FFA.js"},
  {name: "gamemodes:HungerGames", src: "gamemodes/HungerGames.js", dst: "./gamemodes/HungerGames.js"},
  {name: "gamemodes:Leap", src: "gamemodes/Leap.js", dst: "./gamemodes/Leap.js"},
  {name: "gamemodes:Mode", src: "gamemodes/Mode.js", dst: "./gamemodes/Mode.js"},
  {name: "gamemodes:NoCollisionTeamX", src: "gamemodes/NoCollisionTeamX.js", dst: "./gamemodes/NoCollisionTeamX.js"},
  {name: "gamemodes:NoCollisionTeamZ", src: "gamemodes/NoCollisionTeamZ.js", dst: "./gamemodes/NoCollisionTeamZ.js"},
  {name: "gamemodes:NoCollisionTeams", src: "gamemodes/NoCollisionTeams.js", dst: "./gamemodes/NoCollisionTeams.js"},
  {name: "gamemodes:Rainbow", src: "gamemodes/Rainbow.js", dst: "./gamemodes/Rainbow.js"},
  {name: "gamemodes:SFFA", src: "gamemodes/SFFA.js", dst: "./gamemodes/SFFA.js"},
  {name: "gamemodes:TFFA", src: "gamemodes/TFFA.js", dst: "./gamemodes/TFFA.js"},
  {name: "gamemodes:TeamZ", src: "gamemodes/TeamZ.js", dst: "./gamemodes/TeamZ.js"},
  {name: "gamemodes:TeamX", src: "gamemodes/TeamX.js", dst: "./gamemodes/TeamX.js"},
  {name: "gamemodes:Teams", src: "gamemodes/Teams.js", dst: "./gamemodes/Teams.js"},
  {name: "gamemodes:Tournament", src: "gamemodes/Tournament.js", dst: "./gamemodes/Tournament.js"},
  {name: "gamemodes:Unlimitffa", src: "gamemodes/Unlimitffa.js", dst: "./gamemodes/Unlimitffa.js"},
  {name: "gamemodes:Unlimitpvp", src: "gamemodes/Unlimitpvp.js", dst: "./gamemodes/Unlimitpvp.js"},
  {name: "gamemodes:Virus", src: "gamemodes/Virus.js", dst: "./gamemodes/Virus.js"},
  {name: "gamemodes:VirusOff", src: "gamemodes/VirusOff.js", dst: "./gamemodes/VirusOff.js"},
  {name: "gamemodes:Zombie", src: "gamemodes/Zombie.js", dst: "./gamemodes/Zombie.js"},
  {name: "modules:CommandList", src: "modules/CommandList.js", dst: "./modules/CommandList.js"},
  {name: "modules:ini", src: "modules/ini.js", dst: "./modules/ini.js"},
  {name: "modules:log", src: "modules/log.js", dst: "./modules/log.js"},
  {name: "modules:commands:", src: "modules/commands/log.js", dst: "./modules/commands/log.js"},
  {name: "modules:commands:addbot.js", src: "modules/commands/addbot.js", dst: "./modules/commands/addbot.js"},
  {name: "modules:commands:announce.js", src: "modules/commands/announce.js", dst: "./modules/commands/announce.js"},
  {name: "modules:commands:ban.js", src: "modules/commands/ban.js", dst: "./modules/commands/ban.js"},
  {name: "modules:commands:banlist.js", src: "modules/commands/banlist.js", dst: "./modules/commands/banlist.js"},
  {name: "modules:commands:banrange.js", src: "modules/commands/banrange.js", dst: "./modules/commands/banrange.js"},
  {name: "modules:commands:board.js", src: "modules/commands/board.js", dst: "./modules/commands/board.js"},
  {name: "modules:commands:boardreset.js", src: "modules/commands/boardreset.js", dst: "./modules/commands/boardreset.js"},
  {name: "modules:commands:change.js", src: "modules/commands/change.js", dst: "./modules/commands/change.js"},
  {name: "modules:commands:changelog.js", src: "modules/commands/changelog.js", dst: "./modules/commands/changelog.js"},
  {name: "modules:commands:clearban.js", src: "modules/commands/clearban.js", dst: "./modules/commands/clearban.js"},
  {name: "modules:commands:clear.js", src: "modules/commands/clear.js", dst: "./modules/commands/clear.js"},
  {name: "modules:commands:clearwhitelist.js", src: "modules/commands/clearwhitelist.js", dst: "./modules/commands/clearwhitelist.js"},
  {name: "modules:commands:color.js", src: "modules/commands/color.js", dst: "./modules/commands/color.js"},
  {name: "modules:commands:colortext.js", src: "modules/commands/colortext.js", dst: "./modules/commands/colortext.js"},
  {name: "modules:commands:delete.js", src: "modules/commands/delete.js", dst: "./modules/commands/delete.js"},
  {name: "modules:commands:dop.js", src: "modules/commands/dop.js", dst: "./modules/commands/dop.js"},
  {name: "modules:commands:enlarge.js", src: "modules/commands/enlarge.js", dst: "./modules/commands/enlarge.js"},
  {name: "modules:commands:exit.js", src: "modules/commands/exit.js", dst: "./modules/commands/exit.js"},
  {name: "modules:commands:explode.js", src: "modules/commands/explode.js", dst: "./modules/commands/explode.js"},
  {name: "modules:commands:fillChar.js", src: "modules/commands/fillChar.js", dst: "./modules/commands/fillChar.js"},
  {name: "modules:commands:fmsg.js", src: "modules/commands/fmsg.js", dst: "./modules/commands/fmsg.js"},
  {name: "modules:commands:food.js", src: "modules/commands/food.js", dst: "./modules/commands/food.js"},
  {name: "modules:commands:freeze.js", src: "modules/commands/freeze.js", dst: "./modules/commands/freeze.js"},
  {name: "modules:commands:gamemode.js", src: "modules/commands/gamemode.js", dst: "./modules/commands/gamemode.js"},
  {name: "modules:commands:highscore.js", src: "modules/commands/highscore.js", dst: "./modules/commands/highscore.js"},
  {name: "modules:commands:kickbots.js", src: "modules/commands/kickbots.js", dst: "./modules/commands/kickbots.js"},
  {name: "modules:commands:kick.js", src: "modules/commands/kick.js", dst: "./modules/commands/kick.js"},
  {name: "modules:commands:kickrange.js", src: "modules/commands/kickrange.js", dst: "./modules/commands/kickrange.js"},
  {name: "modules:commands:killall.js", src: "modules/commands/killall.js", dst: "./modules/commands/killall.js"},
  {name: "modules:commands:killbots.js", src: "modules/commands/killbots.js", dst: "./modules/commands/killbots.js"},
  {name: "modules:commands:kill.js", src: "modules/commands/kill.js", dst: "./modules/commands/kill.js"},
  {name: "modules:commands:killrange.js", src: "modules/commands/killrange.js", dst: "./modules/commands/killrange.js"},
  {name: "modules:commands:mass.js", src: "modules/commands/mass.js", dst: "./modules/commands/mass.js"},
  {name: "modules:commands:merge.js", src: "modules/commands/merge.js", dst: "./modules/commands/merge.js"},
  {name: "modules:commands:minion.js", src: "modules/commands/minion.js", dst: "./modules/commands/minion.js"},
  {name: "modules:commands:msg.js", src: "modules/commands/msg.js", dst: "./modules/commands/msg.js"},
  {name: "modules:commands:name.js", src: "modules/commands/name.js", dst: "./modules/commands/name.js"},
  {name: "modules:commands:nojoin.js", src: "modules/commands/nojoin.js", dst: "./modules/commands/nojoin.js"},
  {name: "modules:commands:opbyip.js", src: "modules/commands/opbyip.js", dst: "./modules/commands/opbyip.js"},
  {name: "modules:commands:op.js", src: "modules/commands/op.js", dst: "./modules/commands/op.js"},
  {name: "modules:commands:pause.js", src: "modules/commands/pause.js", dst: "./modules/commands/pause.js"},
  {name: "modules:commands:pcmd.js", src: "modules/commands/pcmd.js", dst: "./modules/commands/pcmd.js"},
  {name: "modules:commands:pfmsg.js", src: "modules/commands/pfmsg.js", dst: "./modules/commands/pfmsg.js"},
  {name: "modules:commands:playerlist.js", src: "modules/commands/playerlist.js", dst: "./modules/commands/playerlist.js"},
  {name: "modules:commands:pmsg.js", src: "modules/commands/pmsg.js", dst: "./modules/commands/pmsg.js"},
  {name: "modules:commands:rainbow.js", src: "modules/commands/rainbow.js", dst: "./modules/commands/rainbow.js"},
  {name: "modules:commands:range.js", src: "modules/commands/range.js", dst: "./modules/commands/range.js"},
  {name: "modules:commands:reload.js", src: "modules/commands/reload.js", dst: "./modules/commands/reload.js"},
  {name: "modules:commands:resetateam.js", src: "modules/commands/resetateam.js", dst: "./modules/commands/resetateam.js"},
  {name: "modules:commands:reset.js", src: "modules/commands/reset.js", dst: "./modules/commands/reset.js"},
  {name: "modules:commands:resetvirus.js", src: "modules/commands/resetvirus.js", dst: "./modules/commands/resetvirus.js"},
  {name: "modules:commands:restart.js", src: "modules/commands/restart.js", dst: "./modules/commands/restart.js"},
  {name: "modules:commands:rop.js", src: "modules/commands/rop.js", dst: "./modules/commands/rop.js"},
  {name: "modules:commands:shrink.js", src: "modules/commands/shrink.js", dst: "./modules/commands/shrink.js"},
  {name: "modules:commands:spawnmass.js", src: "modules/commands/spawnmass.js", dst: "./modules/commands/spawnmass.js"},
  {name: "modules:commands:speed.js", src: "modules/commands/speed.js", dst: "./modules/commands/speed.js"},
  {name: "modules:commands:spfmsg.js", src: "modules/commands/spfmsg.js", dst: "./modules/commands/spfmsg.js"},
  {name: "modules:commands:split.js", src: "modules/commands/split.js", dst: "./modules/commands/split.js"},
  {name: "modules:commands:spmsg.js", src: "modules/commands/spmsg.js", dst: "./modules/commands/spmsg.js"},
  {name: "modules:commands:status.js", src: "modules/commands/status.js", dst: "./modules/commands/status.js"},
  {name: "modules:commands:team.js", src: "modules/commands/team.js", dst: "./modules/commands/team.js"},
  {name: "modules:commands:tp.js", src: "modules/commands/tp.js", dst: "./modules/commands/tp.js"},
  {name: "modules:commands:troll.js", src: "modules/commands/troll.js", dst: "./modules/commands/troll.js"},
  {name: "modules:commands:unban.js", src: "modules/commands/unban.js", dst: "./modules/commands/unban.js"},
  {name: "modules:commands:unwhitelist.js", src: "modules/commands/unwhitelist.js", dst: "./modules/commands/unwhitelist.js"},
  {name: "modules:commands:update.js", src: "modules/commands/update.js", dst: "./modules/commands/update.js"},
  {name: "modules:commands:verify.js", src: "modules/commands/verify.js", dst: "./modules/commands/verify.js"},
  {name: "modules:commands:virus.js", src: "modules/commands/virus.js", dst: "./modules/commands/virus.js"},
  {name: "modules:commands:whitelist2.js", src: "modules/commands/whitelist2.js", dst: "./modules/commands/whitelist2.js"},
  {name: "modules:commands:whitelist.js", src: "modules/commands/whitelist.js", dst: "./modules/commands/whitelist.js"},
  {name: "README", src: "README.md", dst: "./README.md"},
  {name: "Newfeatures", src: "Newfeatures.md", dst: "./Newfeatures.md"},
  {name: "files", src: "files.txt", dst: "./files.txt"},
];

function getFileByName(name) {
  fileList.find((ele)->{
    return ele.name === name;
  });
}

function downloadFile(file, cb) {
  request(url + file.src, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      fs.writeFile(file.dst, body, (err, res)->{
        if (typeof cb === "function"){
          cb(err, res);
        }
      });
    } else {
      console.log("[Update] Couldnt connect to servers. Aborting...");
    }
  });
}

function downloadAllFiles(){
  let done = 0;
  function cb(err, res) {
    done--;
  }

  fileList.forEach((file)->{
    done++;
    downloadFile(file, cb)
  });
  while (done > 0) {
    // do nothing wait for all of the cb's to finsh
  }
  afterDownload(null, null);
}

function afterDownload(err, res){
  if (err) {
    console.err("[Console] Error: failed to download some or all files. err msg: " + err);
    console.err("[Console] Error: server is likely not in a viable state. You should manually reinstall it!");
    console.err("[Console] Error: Shutting down!");
    gameServer.socketServer.close();
    process.exit(3);
  } else {
    setTimeout(function () {
      if (!abort) {
        console.log("[Update] Done! Now restarting/closing...");
        gameServer.socketServer.close();
        process.exit(3);
      }
    }, 8000);
  }
}

module.exports = function (gameServer, split) {
  var ok = split[1];
  if (!fs.existsSync('./packet')) {
    console.err("[Console] Error: could not perform action. Cause: You deleted folders or you are using a binary");
    return;
  }
  if (ok == "botnames") {
    console.log("[Update] Updating Botnames");
    downloadFile(getFileByName("botnames"), (err, res)->{
      if (!err) {
        downloadFile(getFileByName("realisticnames"), afterDownload);
      } else {
        console.err("[Console] Error: failed to download files. err msg: " + err);
      }
    });

  } else if (ok == "skins") {
    console.log("[Console] Updating customskin.txt...");
    downloadFile(getFileByName("customskins"), afterDownload);
  } else if (ok == "all") {
    console.log("[Console] Fetching data from the servers..."); // Gameserver.js
    downloadAllFiles();
  } else {
    console.log("[Console] Please do update all,botnames,skins instead of update to confirm");
  }
};
