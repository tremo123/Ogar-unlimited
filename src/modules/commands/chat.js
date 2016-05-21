module.exports = function (gameServer, split) {
  
 if (split[1] == "all") {
   if (!split[2]) {
    console.log("[Console] Please specify a message!")
    return;
  }
  gameServer.msgAll(split[2]);
  console.log("[Console] Message sent to all");
   
 } else if (split[1] == "pm") {
   var id = parseInt(split[2])
   if (!id) {
    console.log("[Console] Please specify a player!")
    return;
  }
  if (!split[3]) {
    console.log("[Console] Please specify a message!")
    return;
  }
   gameServer.pm(id,split[3]);
   console.log("[Console] Message sent to player " + id);
 } else {
   console.log("[Console] Please specify a tag! Available: all, pm");
 }
 
  
}
