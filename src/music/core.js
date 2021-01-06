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
        repeat: 0,
        playing: true
      };

      Main.queue.set(message.guild.id, queueContruct);

      queueContruct.songs.push(song);

      // load message
      load_msg.then(function(msg) {
        msg.delete();
      });

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
      if(serverQueue.songs.length == 0) {
        serverQueue.songs.push(song);
        // load message
        load_msg.then(function(msg) {
          msg.delete();
        });
        try {
          play(message.guild, song)
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
    }
  })
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
  if (!serverQueue)
    return message.channel.send("[**!**] There is no song that I could skip!");
  serverQueue.connection.dispatcher.end();
  message.channel.send(
    "[**!**] Skipped current song."
  );
}

function stop(message, serverQueue) {
  if (!serverQueue)
    return message.channel.send("[**!**] There is no song that I could stop!");

  serverQueue.songs.shift();
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

function config(message, serverQueue) {
  const config  = message.content.replace("a>config", "");
  for(const each of (config.replace(/\s+/g,' ').trim()).split(' ')) {
    try {
      const cfg_val = each.split('=');
      const c_key = cfg_val[0];
      const c_val = cfg_val[1];
      if(!c_key || !c_val) return message.channel.send("[**!**] Missing arguments.");
      switch (c_key) {
        case "volume":
          if(c_val >= 0 && c_val <= 100) {
            serverQueue.volume = c_val;
            message.channel.send(`[**!**] Config updated.`);
          } else
            message.channel.send(`[**!**] Invalid Volume option **${c_val}**`);
          break;
        case "repeat":
          if(c_val == 0) {
            serverQueue.repeat == 0;
            message.channel.send(`[**!**] Config updated.`);
          } else if(c_val == 1) {
            serverQueue.repeat == 1;
            message.channel.send(`[**!**] Config updated.`);
          } else if(c_val == 2) {
            serverQueue.repeat == 2;
            message.channel.send(`[**!**] Config updated.`);
          } else
            message.channel.send(`[**!**] Invalid Repeat option **${c_val}**`);
          break;
        default:
          message.channel.send(`[**!**] Invalid config **${c_key}**`);
      }
    } catch (err) {
      return message.channel.send("[**!**] Syntax error.\n**" + err + "**");
    }
    //message.channel.send(serverQueue);
  }
}

function shuffle(message, serverQueue) {
  if (!serverQueue)
    return message.channel.send("[**!**] There are no songs to shuffle!");
  const a_b = serverQueue.songs;
  const first = a_b.shift();
  const s_f = shuffleArray(a_b);
  s_f.unshift(first);
  serverQueue.songs = s_f;
  return message.channel.send("[**!**] Shuffled!");
}

function play(guild, song) {
  const serverQueue = Main.queue.get(guild.id);
  if (!song) {
    //serverQueue.voiceChannel.leave();
    //Main.queue.delete(guild.id);
    serverQueue.songs.shift();
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

module.exports = { execute, skip, stop, stream, control, config, shuffle };
