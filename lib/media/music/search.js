const dc = require('discord.js'),
    sc = require('./platforms/soundcloud'),
    bc = require('./platforms/bandcamp'),
    yt = require('./platforms/youtube');

async function search(query, message, _once) {
    const load = await message.channel.send(`Searching...`);

    const limit = _once ? 1 :
        (query.match(/-c\d+/g)) ? ((query.match(/-c\d+/g)[0].replace('-c', '') > 25) ? 25 :
            query.match(/-c\d+/g)[0].replace('-c', '')) : 10;

    const platform =
        query.includes('soundcloud') ? 'sc' :
        query.includes('bandcamp') ? 'bc' :
        query.includes('-sc') ? 'sc' :
        query.includes('-bc') ? 'bc' :
        'yt';

    query = query.replace('-sc', '').replace('-bc', '').replace(/-c\d+/g, '');
    const search =
        platform === 'sc' ? await sc.search(query, limit) :
        platform === 'bc' ? await bc.search(query, limit) :
        await yt.search(query, limit);

    const temp = new Map();
    const embed = new dc.MessageEmbed().setColor('#e3b900')
        .setTitle('**Results**')
        .setDescription(`Type a number to play a song. Only valid from **1-${search.length}**\nType anything else will remove this message or after 30 secs it will remove itself.`)
        .setFooter(message.author.tag);
    for (let i = 0; i < search.length; i++) {
        const song = search[i];

        const title =
            (platform === 'sc' || platform === 'yt') ? song.title : song.name;
        const artist =
            (platform === 'sc') ? song.user.username :
            (platform === 'bc') ? song.artist :
            song.author.name;
        const url =
            (platform === 'sc') ? song.permalink_url :
            song.url;
        const thumbnail =
            (platform === 'sc') ? song.artwork_url :
            (platform === 'bc') ? song.imageUrl :
            song.bestThumbnail.url;
        const duration =
            (platform === 'sc') ? require('../../etc/utils').time_format(Math.round(song.full_duration / 1000)) :
            (platform === 'yt') ? song.duration :
            (await require('bandcamp-fetch').getTrackInfo(song.url)).duration;
        const track = {
            title: title,
            artist: artist,
            url: url,
            thumbnail: thumbnail,
            duration: duration,
            request: message.author.tag
        };

        temp.set(`s${i + 1}`, track);

        if (i === 0) embed.setThumbnail(thumbnail);
        if (_once) {
            load.delete();
            return require('./player').play(platform, track, message.member.voice.channel, message.channel);
        }

        embed.addField(`${i + 1}. ${title}`, `[ **${artist}** ] - [ **[Source](${url})** ]`);
    }

    load.delete();
    message.channel.send(embed).then(recent => {
        recent.channel.awaitMessages(m => m.author.id == message.author.id, {
            max: 1,
            time: 30000
        }).then(async collected => {
            if (/^-?\d+$/.test(collected.first().content) && collected.first().content > 0 && collected.first().content < search.length + 1) {
                const track = temp.get(`s${collected.first().content}`);

                if (!message.member.voice.channel)
                    message.channel.send(`Please join a voice channel first!`);
                else
                    require('./player').play(platform, track, message.member.voice.channel, message.channel);

                recent.delete();
                collected.first().delete();
            } else {
                recent.delete();
            }
        }).catch((e) => {
            console.log(e)
            recent.delete();
        });
    });
}

module.exports = {
    search
}