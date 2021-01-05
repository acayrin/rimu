const ytdl = require('ytdl-core');
let DJ;

module.exports = function() {
  this.mp_lookup = async function(arg) {
    const songInfo = await ytdl.getInfo(arg);
    const song = {
        title: songInfo.videoDetails.title,
        url: songInfo.videoDetails.video_url,
    };
    return song;
  },
  this.mp_play = function(message, song) {
    const voiceChannel = message.member.voice.channel;
        voiceChannel.join().then(connection => {
          const stream = ytdl(song, {filter: 'audioonly', quality: 'highestaudio'}).on("info", info => {
            console.log(`> Playing ${info.videoDetails.author.name} - ${info.videoDetails.title}`);
            message.channel.send(`Playing **${info.videoDetails.title}** by **${info.videoDetails.author.name}**`);
          });
          DJ = connection.play(stream);
          DJ.on("finish", end => {
              voiceChannel.leave();
          });
        }).catch(err => console.log(err));
      //DJ.setVolumeLogarithmic(voiceChannel.volume / 1);
      //voiceChannel.guild.id.textChannel.send(`Start playing: **${song.title}**`);
  };
}
