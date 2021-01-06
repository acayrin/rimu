const Main = require('../main');
const MC = require('./music/core');
const lkYT = require('./music/lookupYT');
const Discord = require('discord.js');

module.exports = function() {
  this.cmd_proc = async function(message) {
    const serverQueue = Main.queue.get(message.guild.id);
    if (message.content.startsWith("a>help") || message.content.startsWith("a>h")) {
      const embed = new Discord.MessageEmbed()
        .setColor('#e3b900')
        .setTitle('**Help**')
        .setDescription("This is acay's bot help page")
        .setFooter('by acay#9388')
        .addField("1. a>play [string]", "Play a song by given string or link", true)
        .addField("2. a>q", "Pause/Resume the player", true)
        .addField("3. a>skip", "Skip current song", true)
        .addField("\u200C", "\u200C", false)
        .addField("4. a>search [options] [string]", "> Search a song by given string" +
          "\n\n> **--sort-r**\n> Sort by rating" +
          "\n\n> **--sort-vc**\n> Sort by view count" +
          "\n\n> **--c-[number]**\n> Change amount of results\n> Accept range **1-25**\n> eg: `--c-10`" +
          "\n> Maximum **25** items only", true)
        .addField("5. a>config [options]", "> Change player options" +
          "\n\n> **volume=[number]**\n> Change player volume\n> Accept ramge **0.0-1.0**\n> eg: `volume=0.8`" +
          "\n\n> **repeat=[number]**\n> Whether player repeat or not\n> Accept **0** or **1** or **2**\n> eg: `repeat=1`" +
          "\n> **0** = disable repeat\n> **1** = repeat current\n> **2** = repeat playlist", true)
        .addField("\u200C", "\u200C", false)
        .addField("6. a>stop", "Stop the stream and exit channel", true)
        .addField("7. a>shuffle (a>sf)", "Shuffle playlist", true)
        .addField("8. a>help (a>h)", "Show the help page", true)
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
  }
}
