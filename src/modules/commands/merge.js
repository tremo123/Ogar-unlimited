module.exports = function (gameServer, split) {
 // Validation checks
        var id = parseInt(split[1]);
        var set = split[2];
        if (isNaN(id)) {
            console.log("[Console] Please specify a valid player ID!");
            return;
        }

        // Find client with same ID as player entered
        var client;
        for (var i = 0; i < gameServer.clients.length; i++) {
            if (gameServer.clients[i].playerTracker.pID == id) {
                client = gameServer.clients[i].playerTracker;
                break;
            }
        }

        if (!client) {
            console.log("[Console] This player is nonexistent!");
            return;
        }

        if (client.cells.length == 1) {
            console.log("[Console] That player already has one cell!");
            return;
        }

        // Set client's merge override
        var state;
        if (set == "true") {
            client.recombineinstant = true;
            client.mergeOverride = true;
            client.mergeOverrideDuration = 200;
            state = true;
        } else if (set == "false") {
            client.recombineinstant = false;
            client.mergeOverride = false;
            client.mergeOverrideDuration = 0;
            state = false;
        } else {
            if (client.mergeOverride) {
                client.recombineinstant = false;
                client.mergeOverride = false;
                client.mergeOverrideDuration = 0;
            } else {
                client.recombineinstant = true;
                client.mergeOverride = true;
                client.mergeOverrideDuration = 200;
            }

            state = client.mergeOverride;
        }
        // Log
        if (state) console.log("[Console] Player " + client.name + " is now force merging");
        else console.log("[Console] Player " + client.name + " is no longer force merging");
};
