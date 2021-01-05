require('../utils')();
const Main = require('../../main.js');
const Discord = require("discord.js");
const ytdl = require("ytdl-core");

async function execute(message, serverQueue, directURL /** optional **/) {
  const url = (directURL) ? directURL : message.content.replace("a>play", "");

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

  const song = {
        title: '',
        author: '',
        url: '',
        duration: ''
  };

  await ytdl(url, {filter: 'audioonly', quality: 'highestaudio'}).on('info', async (info) => {
    song.title = info.videoDetails.title;
    song.author = info.videoDetails.author.name;
    song.url = info.videoDetails.video_url;
    song.duration = info.videoDetails.lengthSeconds;

    if (!serverQueue) {
      const queueContruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true
      };

      Main.queue.set(message.guild.id, queueContruct);

      queueContruct.songs.push(song);

      try {
        var connection = await voiceChannel.join();
        queueContruct.connection = connection;
        play(message.guild, queueContruct.songs[0]);
      } catch (err) {
        console.log(err);
        Main.queue.delete(message.guild.id);
        return message.channel.send(err);
      }
    } else {
      serverQueue.songs.push(song);
      return message.channel.send(`**${song.title}** has been added to the queue!`);
    }
  });
}

function skip(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to stop the music!"
    );
  if (!serverQueue)
    return message.channel.send("There is no song that I could skip!");
  serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to stop the music!"
    );

  if (!serverQueue)
    return message.channel.send("There is no song that I could stop!");

  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
}

function play(guild, song) {
  const serverQueue = Main.queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    Main.queue.delete(guild.id);
    return;
  }

  const embed = new Discord.MessageEmbed()
    .setColor('#e3b900')
    .setTitle(song.title)
    .setURL(song.url)
    .setAuthor('🎧 Now playing')
    .setDescription(`by **${song.author}** - duration **${time_format(song.duration)}**`);

  serverQueue.textChannel.send(embed).then(recent => {
    const dispatcher = serverQueue.connection
      .play(ytdl(song.url, {filter: 'audioonly', quality: 'highestaudio'}))
      .on("finish", () => {

        embed.setAuthor('🎧 Completed');
        recent.delete();
        serverQueue.textChannel.send(embed);

        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
      })
      .on("error", error => console.error(error));

    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  });
}

module.exports = { execute, skip, stop };
