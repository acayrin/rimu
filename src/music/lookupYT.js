require('../utils')();
const Main = require('../../main');
const MC = require('./core');
const Discord = require('discord.js');
const ytsr = require('ytsr');
  // look up video
async function lookup_YT(message) {
  const channel = message.channel;
  const search = await ytsr.getFilters(message.content.replace("a>search", ""))
                        .catch(() => {return channel.send("**An error has occured.**")});
  const f1 = search.get('Type').get('Video');
  const opt = {limit: 10};
  const results = await ytsr(f1.url, opt)
                          .catch(() => {return channel.send("**An error has occured.**")});
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
        { max: 1, time: 30000 }).then(collected => {
          if (collected.first().emoji.name == '👍') {
            MC.execute(message, Main.queue.get(message.guild.id), embed.url);
            recent.delete();
          }
      }).catch(() => {
        recent.delete();
      })
    })
  }
}

module.exports = { lookup_YT };
