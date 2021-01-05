const Main = require('../main');
const MC = require('./music/core');
const lkYT = require('./music/lookupYT');

module.exports = function() {
  this.cmd_proc = function(message) {
    const serverQueue = Main.queue.get(message.guild.id);
    if (message.content.startsWith("a>play")) {
      MC.execute(message, serverQueue, null);
    }
    if (message.content.startsWith("a>search")) {
      lkYT.lookup_YT(message);
    }
  }
}
