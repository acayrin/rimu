const Soundcloud = require('soundcloud-downloader').create({
    clientID: require('../../Rimu').scID
});
const Youtube = require('ytdl-core'),
    Bandcamp = require('../../libs/bandcamp-fetch/index'),
    Prism = require('./stream'),
    EmbedBuilder = require('../../libs/lib').embedBuilder,
    Lib = require('../../libs/lib'),
    Rimu = require('../../Rimu');

function play(platform, track, voiceID, textID) {
    Rimu.client.joinVoiceChannel(voiceID).then(async connection => {
        const title = track.title,
            artist = track.artist,
            url = track.url,
            request = track.request,
            thumbnail = track.thumbnail,
            duration = track.duration;

        const embed = new EmbedBuilder();
        embed.setColor(0xe3b900);
        embed.setTitle(title);
        embed.setURL(url);
        embed.setAuthor('🎧 Now playing');
        embed.setThumbnail(thumbnail);
        embed.setDescription(`[ **${artist}** ] - [ **${(!duration) ? 'Livestream' : duration}** ]`);
        embed.setFooter(`- ${request}`);
        Lib.send(textID, '', (embed));

        while (connection.playing || !connection.ready)
            connection.stopPlaying();

        switch (platform) {
            case 'sc':
                var stream = await Soundcloud.download(url);
                connection.play(stream);
                break;
            case 'bc':
                var info = await Bandcamp.getTrackInfo(url);
                require('https').get(info.streamUrl, stream => {
                    connection.play(stream);
                });
                break;
            default:
                connection.play(Youtube(url, {
                    highWaterMark: 16384
                }));
                break;
        }

        connection.once("end", () => {
            embed.setAuthor('🎧 Completed');
            Lib.send(textID, '', (embed));
            connection.disconnect();
        });
        connection.once("error", (e) => {
            console.log(e);
        })
    });
}

module.exports = {
    play
}