const Soundcloud = require('soundcloud-downloader').create({
    clientID: require('../../Rimu').scID
})
const Youtube = require('ytdl-core'),
    Bandcamp = require('bandcamp-fetch'),
    Prism = require('./stream'),
    Discord = require('discord.js');

async function play(platform, track, voiceChannel, textChannel) {
    var connection = await voiceChannel.join();

    const title = track.title,
        artist = track.artist,
        url = track.url,
        request = track.request,
        thumbnail = track.thumbnail,
        duration = track.duration;

    const embed = new Discord.MessageEmbed()
        .setColor('#e3b900')
        .setTitle(title)
        .setURL(url)
        .setAuthor('🎧 Now playing')
        .setThumbnail(thumbnail)
        .setDescription(`[ **${artist}** ] - [ **${(!duration) ? 'Livestream' : duration}** ]`)
        .setFooter(`- ${request}`);
    textChannel.send(embed);

    switch (platform) {
        case 'sc':
            connection.play(Prism.convert(await Soundcloud.download(url)), {
                type: 'opus'
            }).on("finish", () => {
                connection.disconnect();
            });
            break;
        case 'bc':
            var info = await Bandcamp.getTrackInfo(url);
            require('https').get(info.streamUrl, res =>
                connection.play(Prism.convert(res), {
                    type: 'opus'
                }).on("finish", () => {
                    connection.disconnect();
                })
            );
            break;
        default:
            var stream = Youtube(url, {
                highWaterMark: 1 << 10,
                dlChunkSize: 2048,
                liveBuffer: 15000
            });
            connection.play(Prism.convert(stream), {
                type: 'opus'
            }).on("finish", () => {
                connection.disconnect();
            });
    }
}

module.exports = {
    play
}