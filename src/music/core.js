require('../utils')();
const Main = require('../../main.js');
const Discord = require("discord.js");
const ytdl = require("ytdl-core");

async function execute(message, serverQueue, directURL /** for lookup lib **/) {
  const url = (directURL) ? directURL : message.content.replace("a>play", "");

  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel)
    return message.channel.send(
      "[**!**] Please join a voice channel first."
    );
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    return message.channel.send(
      "[**!**] Insufficient permissions. Need Voice.Connect and Voice.Speak."
    );
  }

  const load_msg = message.channel.send(`[**?**] Preparing...`);

  const song = {
        title: '',
        author: '',
        url: '',
        duration: '',
        thumbnail: ''
  };

  await ytdl(url, {filter: 'audioonly', quality: 'highestaudio'}).on('info', async (info) => {
    song.title = info.videoDetails.title;
    song.author = info.videoDetails.author.name;
    song.url = info.videoDetails.video_url;
    song.duration = info.videoDetails.lengthSeconds;
    song.thumbnail = info.videoDetails.thumbnails[3].url;
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
        // load message
        load_msg.then(function(msg) {
          msg.delete();
        });
      } catch (err) {
        console.log(err);
        Main.queue.delete(message.guild.id);
        return message.channel.send(err);
      }
    } else {
      serverQueue.songs.push(song);
      // load message
      load_msg.then(function(msg) {
        msg.delete();
      });
      return message.channel.send(`[ Queue ] ++ [ **${song.author}** ] - [ **${song.title}** ]`);
    }
  });
}

function stream(message, serverQueue) {
  if(!isValidURL(message.content.replace("a>play", ""))) {
    const lkYT = require('./lookupYT');
    lkYT.lookup_YT(message, true).then((out) => {
      if(out)
        execute(message, serverQueue, out);
      else
        return message.channel.send("[**?**] No results found.");
    });
  } else {
    execute(message, serverQueue, null);
  }
}

function skip(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "[**!**] You have to be in a voice channel to skip the music!"
    );
  if (!serverQueue)
    return message.channel.send("[**!**] There is no song that I could skip!");
  serverQueue.connection.dispatcher.end();
  message.channel.send(
    "[**!**] Skipped current song."
  );
}

function stop(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "[**!**] You have to be in a voice channel to stop the music!"
    );

  if (!serverQueue)
    return message.channel.send("[**!**] There is no song that I could stop!");

  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
  message.channel.send(
    "[**!**] Stopped the music player."
  );
}

function control(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "[**!**] You have to be in a voice channel to use this!"
    );

  if (!serverQueue)
    return message.channel.send("[**!**] There is no song to control!");

  if(serverQueue.playing) {
    serverQueue.connection.dispatcher.pause();
    serverQueue.playing = false;
    message.channel.send(
      "[**!**] Paused the music player."
    );
  } else {
    serverQueue.connection.dispatcher.resume();
    serverQueue.playing = true;
    message.channel.send(
      "[**!**] Resumed the music player."
    );
  }
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
    .setThumbnail(song.thumbnail)
    .setDescription(`[ **${song.author}** ] - [ **${time_format(song.duration)}** ]`);

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

module.exports = { execute, skip, stop, stream, control };
