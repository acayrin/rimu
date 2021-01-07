const Main = require('../main');
const MC = require('./music/main');
const lkYT = require('./music/lookupYT');
const Discord = require('discord.js');

module.exports = function() {
  this.cmd_proc = async function(message) {
    const serverQueue = Main.queue.get(message.guild.id);
    if (message.content.startsWith("a>help") || message.content.startsWith("a>h")) {
      const embed = new Discord.MessageEmbed()
        .setColor('#e3b900')
        .setTitle('**Command List**')
        .setFooter('by acay#9388')
        .addField("🎧 Play", "`Usage:` **a>play [string]**\n`Play a song or add a new song to queue`", true)
        .addField("⏯️ Pause/Resume", "`Usage:` **a>q**\n`Pause/Resume the player`", true)
        .addField("⏩ Skip", "`Usage:` **a>skip**\n`Skip current song`", true)
        .addField("⏹️ Stop", "`Usage:` **a>stop**\n`Stop the player and clear the queue`", true)
        .addField("🔄 Shuffle", "`Usage:` **a>shuffle** `|` **a>sf**\n`Shuffle the queue`", true)
        .addField("❓ Help", "`Usage:` **a>help** `|` **a>h**\n`Show the command list\nalias: a>h`", true)
        .addField("\u200C", "\u200C", false)
        .addField("🔍 Search", "`Usage:` **a>search [string] [options]**\n`Search a song by given string, and options for search results`" +
          "\n**--sort-r**\n`Sort by rating`" +
          "\n**--sort-vc**\n`Sort by view count`" +
          "\n**--c-[number]**\n`Change amount of results\nAccept range` **1-25**\n`eg: a>search hello --c-10`" +
          "\n`Maximum` **25** `items only`", true)
        .addField("⚙️ Config", "`Usage:` **a>config [options]**\n`Change player options`" +
          "\n**volume=[number]**\n`Change player volume`\n`Accept range` **0.0-1.0**\n`eg: a>config volume=0.8`" +
          "\n**repeat=[number]**\n`Whether player repeat or not`\n`Accept` **0** `or` **1** `or` **2**" +
          "\n**0** `disable repeat`\n**1** `repeat current`\n**2** `repeat playlist`\n`eg: a>config repeat=1`", true)
      return message.channel.send(embed);
    }
    if (message.content.startsWith("a>play")) {
      return MC.stream(message, serverQueue, null);
    }
    if (message.content.startsWith("a>search")) {
      return lkYT.lookup_YT(message, null);
    }
    if (message.content.startsWith("a>skip")) {
      return MC.skip(message, serverQueue);
    }
    if (message.content.startsWith("a>stop")) {
      return MC.stop(message, serverQueue);
    }
    if (message.content.startsWith("a>shuffle") || message.content.startsWith("a>sf")) {
      return MC.shuffle(message, serverQueue);
    }
    if(message.content.startsWith("a>config")) {
      return MC.config(message, serverQueue);
    }
    if (message.content.startsWith("a>q")) {
      return MC.control(message, serverQueue);
    }
    if (message.content.startsWith("a>img")) {
      const search = message.content.replace("a>img", "").trim();
      const IMG = require('./image/main');
      IMG(message, (search) ? search : null);
    }
  }
}
