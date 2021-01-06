const Main = require('../main');
const MC = require('./music/core');
const lkYT = require('./music/lookupYT');
const Discord = require('discord.js');

module.exports = function() {
  this.cmd_proc = function(message) {
    const serverQueue = Main.queue.get(message.guild.id);
    if (message.content.startsWith("a>help") || message.content.startsWith("a>h")) {
      const embed = new Discord.MessageEmbed()
        .setColor('#e3b900')
        .setTitle('**Help**')
        .setDescription("This is acay's bot help page")
        .setFooter('by acay#9388')
        .addField("1. a>play [string]", "Play a song by given string or link")
        .addField("2. a>search [options] [string]", "Search a song by given string" +
          "\nOptions" +
          "\n`--sort-r` sort by rating" +
          "\n`--sort-vc` sort by view count" +
          "\n`--c-[number]` change amount of results, eg: `--c-10`" +
          "\n maximum 25 items only")
        .addField("3. a>skip", "Skip current song")
        .addField("4. a>stop", "Stop the stream and exit channel")
        .addField("5. a>c", "Pause/Resume the stream")
        .addField("6. a>help (a>h)", "Show the help page")
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
    if (message.content.startsWith("a>c")) {
      return MC.control(message, serverQueue);
    }
  }
}
