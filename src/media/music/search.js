const dc = require('discord.js'),
      sc = require('./platforms/soundcloud'),
      bc = require('./platforms/bandcamp'),
      yt = require('./platforms/youtube'),
      _u = require('../../etc/utils');

async function search(query, message, _once) {
  const temp = new Map();
  const load = await message.channel.send(`Searching...`);
  const limit = _once ? 1 : query.match(/-c\d+/g) ? query.match(/-c\d+/g)[0].replace('-c', '') > 25 ? 25 : query.match(/-c\d+/g)[0].replace('-c', '') : 10;
  const platform = query.includes('soundcloud') ? 'sc' : query.includes('bandcamp') ? 'bc' : query.includes('-sc') ? 'sc' : query.includes('-bc') ? 'bc' : 'yt';
  query = query.replace('-sc', '').replace('-bc', '').replace(/-c\d+/g, '');

  if (_u.isValidURL(query)) {
    let track = {};
    if (platform === 'sc') track = await sc.searchUrl(query);else if (platform === 'bc') track = await bc.searchUrl(query);else track = await yt.searchUrl(query);
    track.request = message.author.tag;
    load.delete();
    return require('./player').play(platform, track, message.member.voice.channel, message.channel);
  }

  const search = platform === 'sc' ? await sc.search(query, limit) : platform === 'bc' ? await bc.search(query, limit) : await yt.search(query, limit);
  const embed = new dc.MessageEmbed().setColor('#e3b900').setTitle('**Results**').setDescription(`Type a number to play a song. Only valid from **1-${search.length}**\nThis message will be invalid after **30** seconds, or from an invalid input.`).setFooter(message.author.tag);

  for (let i = 0; i < search.length; i++) {
    const song = search[i];

    const title =
      platform === 'sc' || platform === 'yt' ? song.title :
        song.name;
    const artist =
      platform === 'sc' ? song.user.username :
        platform === 'bc' ? song.artist :
          song.author.name;
    const url =
      platform === 'sc' ? song.permalink_url :
        song.url;
    const thumbnail =
      platform === 'sc' ? song.artwork_url :
        platform === 'bc' ? song.imageUrl :
          song.bestThumbnail.url;
    const duration =
      platform === 'sc' ? require( '../../etc/utils' ).time_format( Math.round( song.full_duration / 1000 ) ) :
        platform === 'yt' ? song.duration :
          require( '../../etc/utils' ).time_format( Math.round( ( await require( 'bandcamp-fetch' ).getTrackInfo( song.url ) ).duration ) );
    const track = {
      title: title,
      artist: artist ? artist : '?',
      url: url,
      thumbnail: thumbnail,
      duration: duration,
      request: message.author.tag
    };

    temp.set(`s${i + 1}`, track);

    if (_once) {
      load.delete();
      return require('./player').play(platform, track, message.member.voice.channel, message.channel);
    }

    embed.addField(`${i + 1}. ${title}`, `[ **${artist}** ] - [ **[Source](${url})** ]`);
  }

  load.delete();
  message.channel.send(embed).then(recent => {
    let _i = 30;

    const _sI = setInterval(() => {
      embed.setDescription(`Type a number to play a song. Only valid from **1-${search.length}**\nThis message will be invalid after **${_i - 3}** seconds, or from an invalid input.`);
      recent.edit(null, embed);
      _i -= 3;

      if (_i === 0) {
        clearInterval(_sI);
        embed.setDescription('This message is invalid');
        recent.edit(null, embed);
      }
    }, 3000);

    recent.channel.awaitMessages(m => m.author.id == message.author.id, {
      max: 1,
      time: 30000
    }).then(async collected => {
      if (/^-?\d+$/.test(collected.first().content) && collected.first().content > 0 && collected.first().content < search.length + 1) {
        const track = temp.get(`s${collected.first().content}`);
        if (!message.member.voice.channel) message.channel.send(`Please join a voice channel first!`);
        else require('./player').play(platform, track, message.member.voice.channel, message.channel);
      }

      embed.setDescription('This message is no longer valid');
      recent.edit(null, embed);
      clearInterval(_sI);
    });
  });
}

module.exports = {
  search
};