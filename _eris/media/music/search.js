const Rimu = require('../../Rimu'),
    EmbedBuilder = require('../../libs/lib').embedBuilder,
    MessageCollector = require('../../libs/lib').MessageCollector,
    Lib = require('../../libs/lib'),
    sc = require('./platforms/soundcloud'),
    bc = require('./platforms/bandcamp'),
    yt = require('./platforms/youtube');

async function search(query, message, _once) {
    const _msg = new EmbedBuilder();
    _msg.setColor(0xe3b900);
    _msg.setTitle('🔎 Searching...');
    Lib.send(message.channel.id, '', _msg);

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

    const embed = new EmbedBuilder();
    embed.setColor(0xe3b900);
    embed.setTitle('**Results**');
    embed.setDescription(`Type a number to play a song. Only valid from **1-${search.length}**\nThis message will be invalid after 30 seconds, or from an invalid input.`);
    embed.setFooter(message.author.nick);

    const temp = new Map();
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
            (await require('../../libs/bandcamp-fetch/index').getTrackInfo(song.url)).duration;
        const track = {
            title: title,
            artist: artist,
            url: url,
            thumbnail: thumbnail,
            duration: duration,
            request: message.member.nick
        };

        temp.set(`s${i + 1}`, track);

        if (i === 0) embed.setThumbnail(thumbnail);
        if (_once)
            return require('./player').play(platform, track, message.member.voiceState.channelID, message.channel.id);

        embed.addField(`${i + 1}. ${title}`, `${artist} --- [Source](${url})`);
    }

    Lib.send(message.channel.id, '', embed).then((recent) => {
        let collector = new MessageCollector(Rimu.client, message.channel, (m) => m.author.id === message.author.id, {
            time: 1000 * 30
        });

        let _i = 30;
        const _sI = setInterval(() => {
            embed.setDescription(`Type a number to play a song. Only valid from **1-${search.length}**\nThis message will be invalid after **${_i - 3}** seconds, or from an invalid input.`);
            recent.edit({
                embed: embed
            });
            _i -= 3;
            if (_i === 0)
                clearInterval(_sI);
        }, 3000);

        collector.on("collect", (collected) => {
            if (/^-?\d+$/.test(collected.content) && collected.content > 0 && collected.content < search.length + 1) {
                const track = temp.get(`s${collected.content}`);

                if (!message.member.voiceState.channelID)
                    Lib.send(message.channel.id, `Please join a voice channel first!`);
                else
                    require('./player').play(platform, track, message.member.voiceState.channelID, message.channel.id);

                clearInterval(_sI);
            }
        });
    });
}

module.exports = {
    search
}