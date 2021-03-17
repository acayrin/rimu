const Main = require('../Rimu'),
  Media = require('../media/music/search'),
  Genius = require('../media/genius/main'),
  Reddit = require('../media/reddit/main'),
  Discord = require('discord.js'),
  Queue = require('../media/music/queue'),
  Soundpack = require('../media/soundpack/main');

const prefix = "=";

module.exports.cproc = async message => {
  const serverQueue = Queue.getQueue(message.guild.id);

  if (!message.content.startsWith(prefix) || message.author.bot) return;
  const check = message.content.slice(prefix.length).trim();
  const command = check.split(" ").shift().toLowerCase();
  const args = check.slice(command.length).trim();

  if (command === 'help' || command === 'h') {
    const embed = new Discord.MessageEmbed().setColor('#e3b900').setTitle('**Command List**').setFooter('by acay#9388').addField("🎧 Play", "`Usage:` **?h play [string]**\n`Play a song or add a new song to queue`", true).addField("⏯️ Pause/Resume", "`Usage:` **?h q**\n`Pause/Resume the player`", true).addField("⏩ Skip", "`Usage:` **?h skip**\n`Skip current song`", true).addField("⏹️ Stop", "`Usage:` **?h stop**\n`Stop the player and clear the queue`", true).addField("🔄 Shuffle", "`Usage:` **?h shuffle** `|` **?h sf**\n`Shuffle the queue`", true).addField("❓ Help", "`Usage:` **?h help** `|` **?h h**\n`Show the command list\nalias: ?h h`", true).addField("\u200C", "\u200C", false).addField("🔍 Search", "`Usage:` **?h search [string] [options]**\n`Search a song by given string, and options for search results`" + "\n**--c-[number]**\n`Change amount of results\nAccept range` **1-25**\n`eg: ?h search hello --c-10`" + "\n`Maximum` **25** `items only`", true).addField("⚙️ Config", "`Usage:` **?h config [options]**\n`Change player options`" + "\n**volume=[number]**\n`Change player volume`\n`Accept range` **0.0-1.0**\n`eg: ?h config volume=0.8`" + "\n**repeat=[number]**\n`Whether player repeat or not`\n`Accept` **0** `or` **1** `or` **2**" + "\n**0** `disable repeat`\n**1** `repeat current`\n**2** `repeat playlist`\n`eg: ?h config repeat=1`", true);
    return message.channel.send(embed);
  }

  if (command === 'play') {
    return Media.search(args, message, true);
  }

  if (command === 'search') {
    return Media.search(args, message);
  }

  if (command === 'skip') {
    return Youtube.skip(message, serverQueue);
  }

  if (command === 'stop') {
    return Youtube.stop(message, serverQueue);
  }

  if (command === 'shuffle') {
    return Youtube.shuffle(message, serverQueue);
  }

  if (command === 'config') {
    return Youtube.config(message, args, serverQueue);
  }

  if (command === 'q') {
    return Youtube.control(message, serverQueue);
  }

  if (command === 'reddit') {
    return Reddit.fetch(message, args ? args : null);
  }

  if (command === 'lyrics') {
    return Genius.lyrics(message, args);
  }

  if (command === 'sound' && args !== 'list') {
    return Soundpack.play(args, message);
  }

  if (command === 'sound' && args === 'list') {
    return Soundpack.list(message);
  }

  return message.channel.send("Unknown command. Try **=help**");
};