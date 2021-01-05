require('./music_player')();

module.exports = function() {
  this.cmd_proc = function(message) {
    if (message.content.startsWith("a>play")) {
      mp_play(message, null);
    }
    if (message.content.startsWith("a>search")) {
      mp_lookup(message, message.channel);
    }
  }
}
