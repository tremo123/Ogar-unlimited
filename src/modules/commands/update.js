// todo @Michael need to rewrite this function as there is a lot of repeated code that could be refactored / dry
// todo should be a list of files that is handled by a generic function, no need to write the same code for each file
module.exports = function (gameServer, split) {
  var ok = split[1];
  var abort = false;
  if (!fs.existsSync('./packet')) {
    console.log("[Console] Error: could not perform action. Cause: You deleted folders or you are using a binary");
    return;
  }
  if (ok == "botnames") {
    var dbase = 'http://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/botnames.txt';

    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './botnames.txt';
        fs.writeFileSync(filepath, body);

      } else {
        console.log("[Update] Couldnt connect to servers. Aborting...");

      }
    });
    var filename = "botnames.txt";
    console.log("[Update] Updating Botnames");
    var dbase = 'http://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/realisticnames.txt';

    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './realisticnames.txt';
        fs.writeFileSync(filepath, body);

      } else {
        console.log("[Update] Couldnt connect to servers. Aborting...");

      }
    });
    var filename = "realisticnames.txt";
    console.log("[Update] Updating realisticnames.txt");


  } else if (ok == "skins") {

    console.log("[Console] Updating customskin.txt...");
    request('http://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/customskins.txt', function (error, response, body) {
      if (!error && response.statusCode == 200) {

        fs.writeFileSync('./customskins.txt', body);

      } else {
        console.log("[Update] Could not fetch data from servers... Aborting...");

      }
    });
  } else if (ok == "all") {

    console.log("[Console] Fetching data from the servers..."); // Gameserver.js
    if (!fs.existsSync('./customskins.txt')) {
      console.log("[Console] Generating customskin.txt...");
      request('http://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/customskins.txt', function (error, response, body) {
        if (!error && response.statusCode == 200) {

          fs.writeFileSync('./customskins.txt', body);

        } else {
          console.log("[Update] Could not fetch data from servers... will generate empty file");
          fs.writeFileSync('./customskins.txt', "");
        }
      });

    }
    var dbase = 'http://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/realisticnames.txt';

    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './realisticnames.txt';
        fs.writeFileSync(filepath, body);

      } else {
        console.log("[Update] Couldnt connect to servers. Aborting...");

      }
    });
    console.log("[Update] Updating realisticnames.txt");
    request('http://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/GameServer.js', function (error, response, body) {
      if (!error && response.statusCode == 200) {

        fs.writeFileSync('./GameServer.js', body);

      } else {
        console.log("[Update] ERROR: Could not connect to servers. Will abort update");
        abort = true;

      }
    });

    request('http://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/PlayerTracker.js', function (error, response, body) {
      if (!error && response.statusCode == 200) {

        fs.writeFileSync('./PlayerTracker.js', body);

      }
    });
    console.log("[Update] Downloading Playertracker.js");
    var dbase = 'http://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/PacketHandler.js';

    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './PacketHandler.js';
        fs.writeFileSync(filepath, body);

      }
    });
    var filename = "PacketHandler.js";
    console.log("[Update] Downloading " + filename);
    var dbase = 'http://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/botnames.txt';

    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './botnames.txt';
        fs.writeFileSync(filepath, body);

      }
    });
    var filename = "botnames.txt";
    console.log("[Update] Downloading " + filename);
    var dbase = 'http://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/gameserver.ini';

    fs.rename('./gameserver.ini', './oldconfig.ini', function (err) {
      if (err) console.log('ERROR: ' + err);
    });
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './gameserver.ini';
        fs.writeFileSync(filepath, body);
      }
    });
    var filename = "gameserver.ini";
    console.log("[Update] Downloading " + filename);
    var dbase = 'http://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/index.js';

    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './index.js';
        fs.writeFileSync(filepath, body);

      }
    });
    var filename = "index.js";
    console.log("[Update] Downloading " + filename);
    console.log("[Update] Moving on to the folder Packet...");
    var dbase = 'http://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/packet/AddNode.js';

    request(dbase, function (error, response, body) {
      var filepath = './packet/AddNode.js';
      if (!error && response.statusCode == 200) {

        fs.writeFileSync(filepath, body);

      }
    });
    var filename = "AddNode.js";
    console.log("[Update] Downloading " + filename);
    var dbase = 'http://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/packet/ClearNodes.js';

    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './packet/ClearNodes.js';
        fs.writeFileSync(filepath, body);

      }
    });
    var filename = "ClearNodes.js";
    console.log("[Update] Downloading " + filename);
    var dbase = 'http://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/packet/DrawLine.js';

    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './packet/DrawLine.js';
        fs.writeFileSync(filepath, body);

      }
    });
    var filename = "DrawLine.js";
    console.log("[Update] Downloading " + filename);
    var dbase = 'http://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/packet/SetBorder.js';

    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './packet/SetBorder.js';
        fs.writeFileSync(filepath, body);

      }
    });
    var filename = "SetBorder.js";
    console.log("[Update] Downloading " + filename);
    var dbase = 'http://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/packet/UpdateLeaderboard.js';

    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './packet/UpdateLeaderboard.js';
        fs.writeFileSync(filepath, body);

      }
    });
    var filename = "UpdateLeaderboard.js";
    console.log("[Update] Downloading " + filename);
    var dbase = 'http://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/packet/UpdateNodes.js';

    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {

        var filepath = './packet/UpdateNodes.js';
        fs.writeFileSync(filepath, body);

      }
    });
    var filename = "UpdateNodes.js";
    console.log("[Update] Downloading " + filename);

    var dbase = 'http://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/packet/UpdatePosition.js';

    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './packet/UpdatePosition.js';

        fs.writeFileSync(filepath, body);

      }
    });
    var filename = "UpdatePosition.js";
    console.log("[Update] Downloading " + filename);

    var dbase = 'http://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/packet/index.js'; // needed
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './packet/index.js'; // needed
        fs.writeFileSync(filepath, body);
      }
    });
    var filename = "index.js"; // needed
    console.log("[Update] Downloading " + filename);
    console.log("[Update] Moving to folder AI...");

    var dbase = 'http://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/ai/BotLoader.js'; // needed
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './ai/BotLoader.js'; // needed
        fs.writeFileSync(filepath, body);
      }
    });
    var filename = "BotLoader.js"; // needed
    console.log("[Update] Downloading " + filename);
    var dbase = 'http://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/ai/BotLoader.js'; // needed
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './ai/BotLoader.js'; // needed
        fs.writeFileSync(filepath, body);
      }
    });
    var filename = "MinionLoader.js"; // needed
    console.log("[Update] Downloading " + filename);
    var dbase = 'http://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/ai/MinionLoader.js'; // needed
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './ai/MinionLoader.js'; // needed
        fs.writeFileSync(filepath, body);
      }
    });
    var dbase = 'http://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/ai/MinionPlayer.js'; // needed
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './ai/MinionPlayer.js'; // needed
        fs.writeFileSync(filepath, body);
      }
    });
    var dbase = 'http://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/ai/MinionSocket.js'; // needed
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './ai/MinionSocket.js'; // needed
        fs.writeFileSync(filepath, body);
      }
    });
    var filename = "BotLoader.js"; // needed
    console.log("[Update] Downloading " + filename);
    var filename = "BotLoader.js"; // needed
    console.log("[Update] Downloading " + filename);
    var filename = "BotPlayer.js"; // needed
    console.log("[Update] Downloading " + filename);

    var dbase = 'http://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/ai/FakeSocket.js'; // needed
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './ai/FakeSocket.js'; // needed
        fs.writeFileSync(filepath, body);
      }
    });
    var filename = "FakeSocket.js"; // needed
    console.log("[Update] Downloading " + filename);

    var dbase = 'https://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/ai/Readme.txt'; // needed
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './ai/Readme.txt'; // needed
        fs.writeFileSync(filepath, body);
      }
    });
    var filename = "Readme.txt"; // needed
    console.log("[Update] Downloading " + filename);
    console.log("[Update] Moving to folder Entities...");

    var dbase = 'https://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/entity/Beacon.js'; // needed
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './entity/Beacon.js'; // needed
        fs.writeFileSync(filepath, body);
      }
    });
    var filename = "Beacon.js"; // needed
    console.log("[Update] Downloading " + filename);

    var dbase = 'https://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/entity/Cell.js'; // needed
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './entity/Cell.js'; // needed
        fs.writeFileSync(filepath, body);
      }
    });
    var filename = "Cell.js"; // needed
    console.log("[Update] Downloading " + filename);

    var dbase = 'https://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/entity/EjectedMass.js'; // needed
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './entity/EjectedMass.js'; // needed
        fs.writeFileSync(filepath, body);
      }
    });
    var filename = "EjectedMass.js"; // needed
    console.log("[Update] Downloading " + filename);

    var dbase = 'https://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/entity/Food.js'; // needed
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './entity/Food.js'; // needed
        fs.writeFileSync(filepath, body);
      }
    });
    var filename = "Food.js"; // needed
    console.log("[Update] Downloading " + filename);

    var dbase = 'https://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/entity/MotherCell.js'; // needed
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './entity/MotherCell.js'; // needed
        fs.writeFileSync(filepath, body);
      }
    });
    var filename = "MotherCell.js"; // needed
    console.log("[Update] Downloading " + filename);

    var dbase = 'https://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/entity/MovingVirus.js'; // needed
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './entity/MovingVirus.js'; // needed
        fs.writeFileSync(filepath, body);
      }
    });
    var filename = "MovingVirus.js"; // needed
    console.log("[Update] Downloading " + filename);

    var dbase = 'https://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/entity/PlayerCell.js'; // needed
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './entity/PlayerCell.js'; // needed
        fs.writeFileSync(filepath, body);
      }
    });
    var filename = "PlayerCell.js"; // needed
    console.log("[Update] Downloading " + filename);

    var dbase = 'https://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/entity/StickyCell.js'; // needed
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './entity/StickyCell.js'; // needed
        fs.writeFileSync(filepath, body);
      }
    });
    var filename = "StickyCell.js"; // needed
    console.log("[Update] Downloading " + filename);

    var dbase = 'https://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/entity/Virus.js'; // needed
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './entity/Virus.js'; // needed
        fs.writeFileSync(filepath, body);
      }
    });
    var filename = "Virus.js"; // needed
    console.log("[Update] Downloading " + filename);

    var dbase = 'https://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/entity/index.js'; // needed
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './entity/index.js'; // needed
        fs.writeFileSync(filepath, body);
      }
    });
    var filename = "index.js"; // needed
    console.log("[Update] Downloading " + filename);
    console.log("[Update] Moving to the Gamemodes folder...");
    var dbase = 'https://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/gamemodes/BlackHole.js'; // needed
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './gamemodes/BlackHole.js'; // needed
        fs.writeFileSync(filepath, body);
      }
    });
    var filename = "BlackHole.js"; // needed
    console.log("[Update] Downloading " + filename);

    var dbase = 'https://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/gamemodes/Debug.js'; // needed
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './gamemodes/Debug.js'; // needed
        fs.writeFileSync(filepath, body);
      }
    });
    var filename = "Debug.js"; // needed
    console.log("[Update] Downloading " + filename);

    var dbase = 'https://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/gamemodes/Experimental%20v2.js'; // needed
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './gamemodes/Experimental v2.js'; // needed
        fs.writeFileSync(filepath, body);
      }
    });
    var filename = "Experimental v2.js"; // needed
    console.log("[Update] Downloading " + filename);

    var dbase = 'https://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/gamemodes/Experimental.js'; // needed
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './gamemodes/Experimental.js'; // needed
        fs.writeFileSync(filepath, body);
      }
    });
    var filename = "Experimental.js"; // needed
    console.log("[Update] Downloading " + filename);

    var dbase = 'https://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/gamemodes/FFA.js'; // needed
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './gamemodes/FFA.js'; // needed
        fs.writeFileSync(filepath, body);
      }
    });
    var filename = "FFA.js"; // needed
    console.log("[Update] Downloading " + filename);

    var dbase = 'https://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/gamemodes/HungerGames.js'; // needed
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './gamemodes/HungerGames.js'; // needed
        fs.writeFileSync(filepath, body);
      }
    });
    var filename = "HungerGames.js"; // needed
    console.log("[Update] Downloading " + filename);

    var dbase = 'https://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/gamemodes/Leap.js'; // needed
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './gamemodes/Leap.js'; // needed
        fs.writeFileSync(filepath, body);
      }
    });
    var filename = "Leap.js"; // needed
    console.log("[Update] Downloading " + filename);

    var dbase = 'https://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/gamemodes/Mode.js'; // needed
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './gamemodes/Mode.js'; // needed
        fs.writeFileSync(filepath, body);
      }
    });
    var filename = "Mode.js"; // needed
    console.log("[Update] Downloading " + filename);

    var dbase = 'https://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/gamemodes/NoCollisionTeamX.js'; // needed
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './gamemodes/NoCollisionTeamX.js'; // needed
        fs.writeFileSync(filepath, body);
      }
    });
    var filename = "NCteamsx.js"; // needed
    console.log("[Update] Downloading " + filename);

    var dbase = 'https://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/gamemodes/NoCollisionTeamZ.js'; // needed
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './gamemodes/NoCollisionTeamZ.js'; // needed
        fs.writeFileSync(filepath, body);
      }
    });
    var filename = "NCTeamZ.js"; // needed
    console.log("[Update] Downloading " + filename);

    var dbase = 'https://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/gamemodes/NoCollisionTeams.js'; // needed
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './gamemodes/NoCollisionTeams.js'; // needed
        fs.writeFileSync(filepath, body);
      }
    });
    var filename = "NCTeams.js"; // needed
    console.log("[Update] Downloading " + filename);

    var dbase = 'https://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/gamemodes/Rainbow.js'; // needed
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './gamemodes/Rainbow.js'; // needed
        fs.writeFileSync(filepath, body);
      }
    });
    var filename = "Rainbow.js"; // needed
    console.log("[Update] Downloading " + filename);

    var dbase = 'https://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/gamemodes/SFFA.js'; // needed
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './gamemodes/SFFA.js'; // needed
        fs.writeFileSync(filepath, body);
      }
    });
    var filename = "SFFA.js"; // needed
    console.log("[Update] Downloading " + filename);

    var dbase = 'https://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/gamemodes/TFFA.js'; // needed
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './gamemodes/TFFA.js'; // needed
        fs.writeFileSync(filepath, body);
      }
    });
    var filename = "TFFA.js"; // needed
    console.log("[Update] Downloading " + filename);

    var dbase = 'https://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/gamemodes/TeamZ.js'; // needed
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './gamemodes/TeamZ.js'; // needed
        fs.writeFileSync(filepath, body);
      }
    });
    var filename = "Teamz"; // needed
    console.log("[Update] Downloading " + filename);

    var dbase = 'https://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/gamemodes/TeamX.js'; // needed
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './gamemodes/TeamX.js'; // needed
        fs.writeFileSync(filepath, body);
      }
    });
    var filename = "Teamx.js"; // needed
    console.log("[Update] Downloading " + filename);

    var dbase = 'https://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/gamemodes/Teams.js'; // needed
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './gamemodes/Teams.js'; // needed
        fs.writeFileSync(filepath, body);
      }
    });
    var filename = "Teams.js"; // needed
    console.log("[Update] Downloading " + filename);

    var dbase = 'https://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/gamemodes/Tournament.js'; // needed
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './gamemodes/Tournament.js'; // needed
        fs.writeFileSync(filepath, body);
      }
    });
    var filename = "Tournament.js"; // needed
    console.log("[Update] Downloading " + filename);

    var dbase = 'https://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/gamemodes/Unlimitffa.js'; // needed
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './gamemodes/Unlimitffa.js'; // needed
        fs.writeFileSync(filepath, body);
      }
    });
    var filename = "Unlimited FFA.js"; // needed
    console.log("[Update] Downloading " + filename);

    var dbase = 'https://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/gamemodes/Unlimitpvp.js'; // needed
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './gamemodes/Unlimitpvp.js'; // needed
        fs.writeFileSync(filepath, body);
      }
    });
    var filename = "Unlimitpvp.js"; // needed
    console.log("[Update] Downloading " + filename);

    var dbase = 'https://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/gamemodes/Virus.js'; // needed
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './gamemodes/Virus.js'; // needed
        fs.writeFileSync(filepath, body);
      }
    });
    var filename = "Virus.js"; // needed
    console.log("[Update] Downloading " + filename);

    var dbase = 'https://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/gamemodes/VirusOff.js'; // needed
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './gamemodes/VirusOff.js'; // needed
        fs.writeFileSync(filepath, body);
      }
    });
    var filename = "VirusOff.js"; // needed
    console.log("[Update] Downloading " + filename);

    var dbase = 'https://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/gamemodes/Zombie.js'; // needed
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './gamemodes/Zombie.js'; // needed
        fs.writeFileSync(filepath, body);
      }
    });
    var filename = "Zombie.js"; // needed
    console.log("[Update] Downloading " + filename);
    console.log("[Update] Moving to Modules folder");

    var dbase = 'https://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/modules/CommandList.js'; // needed
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './modules/CommandList.js'; // needed
        fs.writeFileSync(filepath, body);
      }
    });
    var filename = "CommandList.js"; // needed
    console.log("[Update] Downloading " + filename);

    var dbase = 'https://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/modules/ini.js'; // needed
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './modules/ini.js'; // needed
        fs.writeFileSync(filepath, body);
      }
    });
    var filename = "ini.js"; // needed
    console.log("[Update] Downloading " + filename);

    var dbase = 'https://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/src/modules/log.js'; // needed
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = './modules/log.js'; // needed
        fs.writeFileSync(filepath, body);
      }
    });
    var filename = "log.js"; // needed
    console.log("[Update] Downloading " + filename);
    console.log("[Update] Downloading readme and newfeatures.md...");
    var dbase = 'https://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/README.md'; // needed
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = '../README.md'; // needed
        fs.writeFileSync(filepath, body);
      }
    });

    var dbase = 'https://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/Newfeatures.md'; // needed
    request(dbase, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var filepath = '../Newfeatures.md'; // needed
        fs.writeFileSync(filepath, body);
        console.log("[Update] Done downloading all files");
        console.log("[Update] Applying update...");
      }
    });


    request('https://raw.githubusercontent.com/AJS-development/Ogar-unlimited/master/files.txt', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        extraf = body.split(/[\r\n]+/).filter(function (x) {
          return x != ''; // filter empty
        });
        for (var i in extraf) {
          gameServer.upextra(extraf[i]);
        }
      }
    });


    setTimeout(function () {
      if (!abort) {
        console.log("[Update] Done! Now restarting/closing...");
        gameServer.socketServer.close();
        process.exit(3);
      }
    }, 8000);
  } else {
    console.log("[Console] Please do update all,botnames,skins instead of update to confirm");
  }
};
