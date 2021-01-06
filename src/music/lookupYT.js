require('../utils')();
const Main = require('../../main');
const MC = require('./core');
const Discord = require('discord.js');
const ytsr = require('ytsr');

async function lookup_YT(message, once /** return top vc value **/) {
  const channel = message.channel;
  let limit = 10;
  let check = message.content.replace("a>search", "").replace("a>play", "").replace("--sort-r", "").replace('--sort-vc', '');
  // items limit
  if(check.match(/--c-\d+/g)) {
    const match = check.match(/--c-\d+/g);
    check = check.replace(match, "");
    limit = (match[0].replace('--c-','')) > 25 ? 25 : match[0].replace('--c-','');
  }
  // loading message
  const load_msg = channel.send("[**?**] Searching...");
  let search = await ytsr.getFilters(check)
                        .catch(err => { console.log(err) });
  let f1 = search.get('Type').get('Video');
  // sort by rating
  if(message.content.includes('--sort-r')) {
    search = await ytsr.getFilters(f1.url);
    f1 = search.get('Sort by').get('Rating');
  }
  // sort by view count
  if(message.content.includes('--sort-vc')) {
    search = await ytsr.getFilters(f1.url);
    f1 = search.get('Sort by').get('View count');
  }
  const opt = {limit: limit};
  const results = await ytsr(f1.url, opt).catch(() => {return channel.send("[**?**] No results found.")});

  // once
  if(once) {
    //console.log(results['items'][0]);
    // loading message
    load_msg.then(function(msg) {
      msg.delete();
    })
    if(results['items'].length === 0)
      return null;
    return results['items'][0].url;
  }
  // if empty
  if(results['items'].length === 0) {
    // loading message
    load_msg.then(function(msg) {
      msg.delete();
    })
    return channel.send("[**?**] No results found.");
  }

  // loading message
  load_msg.then(function(msg) {
    msg.delete();
  })

  const temp = new Map();
  const embed = new Discord.MessageEmbed()
    .setColor('#e3b900')
    .setTitle('**Results**')
    .setDescription(`Type a number to play a song. Only valid from **1-${results['items'].length}**`)
    .setFooter('[?] Type anything else will remove this message or after 30 secs it will remove itself.');
  for(let i = 0; i < results['items'].length; i++) {
    const vid = results['items'][i];
    if(i == 0) embed.setThumbnail(vid.bestThumbnail.url);
    temp.set(`'${i+1}'`, vid.url);
    embed.addField(`${i+1}. ${vid.title}`, `[ **${vid.author.name}** ] - [ **${vid.duration}** ] - < [Source](${vid.url}) >`);
  }

  channel.send(embed).then(recent => {
    // check input
    recent.channel.awaitMessages(m => m.author.id == message.author.id, { max: 1, time: 30000 }).then(collected => {
      if((/^-?\d+$/).test(collected.first().content) && collected.first().content > 0 && collected.first().content < results['items'].length+1) {
        MC.execute(message, Main.queue.get(message.guild.id), temp.get(`'${collected.first().content}'`));
        recent.delete();
        collected.first().delete();
      } else {
        recent.delete();
        //channel.send("[**!**] Invalid input.");
      }
    }).catch(() => {
      recent.delete();
    })
    /** close menu
    recent.react('❌');
    recent.awaitReactions((reaction, user) => user.id == message.author.id && reaction.emoji.name == '❌',
      { max: 1, time: 30000 }).then(collected => {
      if(collected.first().emoji.name == '❌') {
        recent.delete();
      }
    }).catch();**/
  })
}

module.exports = { lookup_YT };
