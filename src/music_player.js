require('./utils')();
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const ytsr = require('ytsr');
let DJ;

module.exports = function() {
  // look up video
  this.mp_lookup = async function(message, channel) {
    const search = await ytsr.getFilters(message.content.replace("a>search", ""));
    const f1 = search.get('Type').get('Video');
    const search2 = await ytsr.getFilters(f1.url);
    const f2 = search2.get('Sort by').get('View count');
    const opt = {limit: 5};
    const results = await ytsr(f2.url, opt);
    // foreach through each results
    for(vid of results['items']) {
      const embed = new Discord.MessageEmbed()
        .setColor('#e3b900')
        .setTitle(vid.title)
        .setURL(vid.url)
        .setAuthor(vid.author.name)
        .setDescription(vid.description)
        .setThumbnail(vid.bestThumbnail.url);
      // send reaction and watch it
      channel.send(embed).then(recent => {
        recent.react('👍');
        recent.awaitReactions((reaction, user) => user.id == message.author.id && reaction.emoji.name == '👍',
          { max: 1, time: 20000 }).then(collected => {
            if (collected.first().emoji.name == '👍') {
              mp_play(message, embed.url);
              recent.delete();
          }
        }).catch(() => {
          recent.delete();
        })
      })
    }
  },

  // play from URL
  // if link not found then parse from message
  this.mp_play = function(message, link) {
    const channel = message.channel;
    const url = (link == null) ? message.content.replace("a>play", "") : link;
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
      return message.channel.send(
        "You need to be in a voice channel to play music!"
      );
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      return channel.sends(
        "I need the permissions to join and speak in your voice channel!"
      );
    }
    voiceChannel.join().then(async (connection) => {
      // fetch the stream
      const stream = await ytdl(url, {filter: 'audioonly', quality: 'highestaudio'}).on("info", info => {

        // play the stream
        DJ = connection.play(stream);
        DJ.setVolume(0.8);

        const embed = new Discord.MessageEmbed()
          .setColor('#e3b900')
          .setTitle(info.videoDetails.title)
          .setURL(info.videoDetails.video_url)
          .setAuthor('🎧 Now playing')
          .setDescription(`by **${info.videoDetails.author.name}** - duration **${time_format(info.videoDetails.lengthSeconds)}**`);
        channel.send(embed).then(recent => {
          DJ.on("finish", end => {
            embed.setAuthor('🎧 Completed');
            recent.delete();
            channel.send(embed);
            voiceChannel.leave();
            clearInterval(inactivity);
          });
        });
      });

      // prevent ghost playback
      const inactivity = setInterval(async function() {
        if (voiceChannel.members.size === 1) {
          voiceChannel.leave();
          clearInterval(inactivity);
          channel.send('Disconnected due to inactivity.');
        }
      }, 300000);
    }).catch(err => console.log(err));
  };
}
