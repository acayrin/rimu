require('../utils')();
const Discord = require("discord.js");
const Main = require('../../main.js');
const ytdl = require("ytdl-core");
let options = {
  timeZone: 'Asia/Bangkok',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
},
formatter = new Intl.DateTimeFormat([], options);

/******************************
  MAIN FUNCTION
******************************/
function stream(message, serverQueue) {
  if(!isValidURL(message.content.replace("a>play", ""))) {
    const lkYT = require('./lookupYT');
    lkYT.lookup_YT(message, true).then(async (out) => {
      if(out)
        await execute(message, serverQueue, out);
      else
        return message.channel.send("[**?**] No results found.");
    });
  } else {
    execute(message, serverQueue, null);
  }
}

/******************************
  EXECUTE FUNCTION
******************************/
async function execute(message, serverQueue, directURL) {
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

  // ===== load message =====//
  const load_msg = message.channel.send(`[**?**] Preparing...`);
  // ===== load message =====//

  const info = await ytdl.getInfo(url);
  const song = {
    title     : info.videoDetails.title,
    author    : info.videoDetails.author.name,
    url       : info.videoDetails.video_url,
    duration  : info.videoDetails.lengthSeconds,
    thumbnail : info.videoDetails.thumbnails[3].url
  }

  if (!serverQueue) {
    const queueContruct = {
      textChannel  : message.channel,
      voiceChannel : voiceChannel,
      connection   : null,
      songs        : [],
      volume       : 5,
      repeat       : 0,
      playing      : true
    };

    Main.queue.set(message.guild.id, queueContruct);

    queueContruct.songs.push(song);

    try {
      var connection = await voiceChannel.join();
      queueContruct.connection = connection;
      play(message, queueContruct.songs[0]);
      // ======= load message =======//
  /****/load_msg.then(function(msg) {/****/
  /****/  msg.delete();              /****/
  /****/});                          /****/
      // ======= load message =======//
    } catch (err) {
      console.log(err);
      Main.queue.delete(message.guild.id);
      return message.channel.send(err);
    }
  } else {
    if(serverQueue.songs.length == 0) {
      serverQueue.songs.push(song);
    // ======= load message =======//
/****/load_msg.then(function(msg) {/****/
/****/  msg.delete();              /****/
/****/});                          /****/
    // ======= load message =======//
      try {
        play(message, song);
      } catch (err) {
        console.log(err);
        Main.queue.delete(message.guild.id);
        return message.channel.send(err);
      }
    } else {
      serverQueue.songs.push(song);
    // ======= load message =======//
/****/load_msg.then(function(msg) {/****/
/****/  msg.delete();              /****/
/****/});                          /****/
    // ======= load message =======//
      return message.channel.send(`[ Queue ] ++ [ **${song.author}** ] - [ **${song.title}** ]`);
    }
  }
}

/******************************
  SKIP FUNCTION
******************************/
function skip(message, serverQueue) {
  if (!serverQueue || !serverQueue.songs || !serverQueue.connection.dispatcher)
    return message.channel.send("[**!**] Queue is empty!");
  serverQueue.connection.dispatcher.end();
  message.channel.send(
    "[**!**] Skipped current song."
  );
}

/******************************
  STOP FUNCTION
******************************/
function stop(message, serverQueue) {
  if (!serverQueue || !serverQueue.songs || !serverQueue.connection.dispatcher)
    return message.channel.send("[**!**] Queue is empty!");

  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
  message.channel.send(
    "[**!**] Stopped the music player."
  );
}

/******************************
  PLAY FUNCTION
******************************/
async function play(message, song) {
  const serverQueue = Main.queue.get(message.guild.id);
  if (!song)
    return serverQueue.songs.shift();
  const embed = new Discord.MessageEmbed()
    .setColor('#e3b900')
    .setTitle(song.title)
    .setURL(song.url)
    .setAuthor('🎧 Now playing')
    .setThumbnail(song.thumbnail)
    .setDescription(`[ **${song.author}** ] - [ **${(song.duration == 0) ? 'Livestream' : time_format(song.duration)}** ]`);
  let em = message.channel.send(embed).then(recent => {em = recent});

  // CONSOLE CHECK
  console.log(`[INFO:${formatter.format(new Date())}] G:${message.guild.id} - U:${song.url}`);
  let info = await ytdl.getInfo(song.url, {filter: 'audioonly', highWaterMark: 1 << 15});
  const stream = () => {
    if (info.livestream) {
      const format = ytdl.chooseFormat(info.formats, {quality: [140,128,127,120,96,95,94,93]});
      return format.url;
    } else return ytdl.downloadFromInfo(info);
  }
  const dispatcher = serverQueue.connection
    .play(stream())
    .on("finish", () => {

      // ======= mics =======
      embed.setAuthor('🎧 Completed');
      em.delete();
      message.channel.send(embed);
      // ======= mics =======

      serverQueue.songs.shift();
      play(message, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
}

/******************************
  CONTROL FUNCTION
******************************/
function control(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "[**!**] You have to be in a voice channel to use this!"
    );
    if (!serverQueue || !serverQueue.songs || !serverQueue.connection.dispatcher)
      return message.channel.send("[**!**] Queue is empty!");

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


/******************************
  CONFIG FUNCTION
******************************/
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
          if(c_val >= 0 && c_val <= 1) {
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
  }
}

/******************************
  SHUFFLE FUNCTION
******************************/
function shuffle(message, serverQueue) {
  if (!serverQueue || !serverQueue.songs)
    return message.channel.send("[**!**] Queue is empty!");
  const a_b = serverQueue.songs;
  const first = a_b.shift();
  const s_f = shuffleArray(a_b);
  s_f.unshift(first);
  serverQueue.songs = s_f;
  return message.channel.send("[**!**] Shuffled!");
}

/******************************
  EXPORTS
******************************/
module.exports = { stream, skip, stop, control, shuffle, config, execute }
