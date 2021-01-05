require('./music_player')();

module.exports = function() {
  this.cmd_proc = function(message) {
    if (message.content.startsWith("a>play")) {
      this.execute(message);
    }
  },
  this.execute = async function execute(message) {
    const title = message.content.replace("a>play", "");
    const song = mp_lookup(title);
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
      return message.channel.send(
        "You need to be in a voice channel to play music!"
      );
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      return message.channel.send(
        "I need the permissions to join and speak in your voice channel!"
      );
    }
    mp_play(message, title);
  }
}
