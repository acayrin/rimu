require('../utils')();
const Main = require('../../main');
const MC = require('./core');
const Discord = require('discord.js');
const ytsr = require('ytsr');

async function lookup_YT(message) {
  const channel = message.channel;
  const load_msg = channel.send("[**?**] Loading...");
  const search = await ytsr.getFilters(message.content.replace("a>search", ""))
                        .catch(err => { console.log(err) });
  const f1 = search.get('Type').get('Video');
  const opt = {limit: 10};
  const results = await ytsr(f1.url, opt)
                          .catch(() => {return channel.send("[**?**] No results found.")});
  // foreach through each results
  const temp = new Map();
  const embed = new Discord.MessageEmbed()
    .setColor('#e3b900')
    .setTitle('**Results**')
    .setDescription(`Type a number to play a song. Only valid from 1-${results['items'].length}`);
  for(let i = 0; i < results['items'].length; i++) {
    const vid = results['items'][i];
    temp.set(`'${i+1}'`, vid.url);
    embed.addField(`${i+1}. ${vid.title}`, `[ **${vid.author.name}** ] - [ **${vid.duration}** ] - < [Source](${vid.url}) >`);
  }

  load_msg.then(function(msg) {
    msg.delete();
  })
  channel.send(embed).then(recent => {
    recent.channel.awaitMessages(m => m.author.id == message.author.id, { max: 1, time: 30000 }).then(collected => {
        if((/^-?\d+$/).test(collected.first().content) && collected.first().content > 0 && collected.first().content < results['items'].length+1) {
          MC.execute(message, Main.queue.get(message.guild.id), temp.get(`'${collected.first().content}'`));
          recent.delete();
          collected.first().delete();
        } else {
          recent.delete();
          channel.send("[**!**] Invalid input.");
        }
    }).catch(() => {
      recent.delete();
    })
  })
}

module.exports = { lookup_YT };
