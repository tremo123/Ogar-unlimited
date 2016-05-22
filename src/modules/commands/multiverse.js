module.exports = function (multiverse, split) {
  
  
 if (split[1] == "list") {
   console.log("[Console] Listing servers...")
  var servers = multiverse.getServers();
  a = 0;
  for (var i in servers) {
    if (!servers[i]) continue;
    a++
    var extra = " ";
    if (servers[i].name == multiverse.getSelected().name) extra = extra + " (Current selected server) ";
    if (servers[i].isMaster) extra = extra + " (Main Master server) ";
    var port = (servers[i].port) ? servers[i].port : "Default";
    console.log("[Console] " + a + ". " + servers[i].name + " running on port " + port + extra); 

    
  }
   
 } else if (split[1] == "create") {
   var port = parseInt(split[3]);
   if (!split[2]) {
     console.log("[Console] Please specify a name");
     return;
   }
   if (isNaN(port)) {
     console.log("[Console] Please specify a port");
     return;
   }
   multiverse.create(split[2],false,port);
   console.log("[Console] Created server " + split[2] + " on port " + port)
   
 } else if (split[1] == "remove") {
   if (!split[2]) {
     console.log("[Console] Please specify a server name");
     return;
   }
 if (!multiverse.remove(split[2])) console.log("[Console] Failed to remove server. Check it is not master or selected");
   else console.log("[Console] Removed server " + split[2]);
 } else if (split[1] == "select") {
   if (!split[2]) {
     console.log("[Console] Please specify a server name");
     return;
   }
    if (multiverse.setSelected(split[2]))
  console.log("[Console] You are now controlling server " + split[2]); 
  else
  console.log("[Console] That server doesnt exist!");
 } else {
   console.log("[Console] Please specify a command! (list, select,remove,create)");
 }
  
  
}
