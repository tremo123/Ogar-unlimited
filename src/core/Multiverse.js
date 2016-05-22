'use strict';
const ControlServer = require('./ControlServer.js')
const ConfigService = require('./ConfigService.js');
module.exports = class Multiverse {
  constructor(version) {
    this.servers = [];
    this.selected = [];
    this.version = version;
    this.whitelist = [];
    this.configService = new ConfigService()
    this.banned = this.configService.getBanned();
    this.master = [];
  }
  
  create(name,ismaster, port) {
    var l = new ControlServer(this.version,this, port,ismaster, name, this.configService, this.banned);
    l.init();
    l.start();
    this.servers[name] = l;
    return l;
  }
  remove(name) {
   
     if (this.servers[name].name == name && !this.servers[name].isMaster && this.servers[name].name != this.selected.name) {
       var ind = this.servers.indexOf(this.servers[name]);
if(ind != -1) {
	this.servers.splice(ind, 1);
} else {
  return false;
}
       
      return true;
     }
   
   return false;
  }
  init() {
    
    this.selected = this.create("main", true);  
  }
  start() {
    
  }
  stop() {
    for (var i in this.servers) this.servers[i].stop();
    this.servers = [];
    this.selected = [];
  }
  getSelected() {
    return this.selected;
  }
  setSelected(a) {
    this.selected = this.servers[a];
  }
  getServers() {
    return this.servers;
  }
  
  
  }
