const Main = require('../../main');
const MC = require('./main');
const Discord = require('discord.js');
const ytsr = require('ytsr');

async function lookup_YT(message, args, once) {
  const channel = message.channel;
  let limit = 10;

  // LIMIT SEARCH ITEMS
  if (args.match(/--c-\d+/g)) {
    const match = args.match(/--c-\d+/g);
    args = args.replace(match, "");
    limit = (match[0].replace('--c-', '')) > 25 ? 25 : match[0].replace('--c-', '');
  }

  // ======= loading message =======
  const load_msg = channel.send("[**?**] Processing...");
  // ======= loading message =======

  let search = await ytsr.getFilters(args).catch(err => {
    message.channel.send("[**!**] Unable to fetch results.");
    console.log(err)
  });
  let f1 = search.get('Type').get('Video');

  // Enabled by Default
  // sort by view count
  search = await ytsr.getFilters(f1.url);
  f1 = search.get('Sort by').get('View count');

  const opt = {
    limit: limit
  };
  const results = await ytsr(f1.url, opt).catch(() => {
    return channel.send("[**?**] No results found.")
  });

  // ======= loading message =======
  load_msg.then(function (msg) {
    msg.delete();
  })
  // ======= loading message =======

  // CHECK IF IT USED FOR QUICK PLAY
  if (once)
    if (results['items'].length === 0)
      return null;
    else
      return results['items'][0].url;

  // CHECK IF THE QUEUE IS EMPTY
  if (!results['items'] || results['items'].length === 0)
    return channel.send("[**?**] No results found.");

  const temp = new Map();
  const embed = new Discord.MessageEmbed()
    .setColor('#e3b900')
    .setTitle('**Results**')
    .setDescription(`Type a number to play a song. Only valid from **1-${results['items'].length}**`)
    .setFooter('[?] Type anything else will remove this message or after 30 secs it will remove itself.');
  for (let i = 0; i < results['items'].length; i++) {
    const vid = results['items'][i];
    if (i == 0) embed.setThumbnail(vid.bestThumbnail.url);
    temp.set(`'${i + 1}'`, vid.url);
    embed.addField(`${i+1}. ${vid.title}`, `[ **${vid.author.name}** ] - [ **${(vid.duration) ? vid.duration : 'Live'}** ] - < [Source](${vid.url}) >`);
  }

  channel.send(embed).then(recent => {
    /***********************
      CHECK FOR USER INPUT
    ***********************/
    recent.channel.awaitMessages(m => m.author.id == message.author.id, {
      max: 1,
      time: 30000
    }).then(collected => {
      if ((/^-?\d+$/).test(collected.first().content) && collected.first().content > 0 && collected.first().content < results['items'].length + 1) {

        MC.execute(message, null, Main.queue.get(message.guild.id), temp.get(`'${collected.first().content}'`));

        recent.delete();
        collected.first().delete();
      } else {
        recent.delete();
      }
    }).catch(() => {
      recent.delete();
    })
  })
}

module.exports = {
  lookup_YT
};