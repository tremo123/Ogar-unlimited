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
  }
  
  create(name,ismaster, port) {
    var l = new ControlServer(this.version,this, port,ismaster, name, this.configService, this.banned);
    l.init();
    l.start();
    this.servers[name] = l;
    return l;
  }
  remove(name) {
    this.servers[name] = [];
    
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
    this.selected = a;
  }
  getServers() {
    return this.servers;
  }
  
  
  }
