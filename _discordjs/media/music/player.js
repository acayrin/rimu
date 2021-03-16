const Soundcloud = require('soundcloud-downloader').create({
    clientID: require('../../Rimu').scID
})
const Youtube = require('ytdl-core'),
    Bandcamp = require('bandcamp-fetch'),
    Prism = require('./stream');

async function play(platform, track, voiceChannel, textChannel) {
    if (!voiceChannel)
        textChannel.send('Please join a voice channel first');
    var connection;
    try {
        connection = await voiceChannel.join();
    } catch (e) {
        connection.disconnect();
        connection = await voiceChannel.join();
    }

    const title = track.title,
        artist = track.artist,
        url = track.url,
        request = track.request,
        thumbnail = track.thumbnail,
        duration = track.duration;

    const _txt = await textChannel.send(`> Playing **${title}** [${(!duration) ? 'Livestream' : duration}] ${artist !== '?' ? 'by **' + artist + '**' : 'from **' + url + '**'}`);

    let stream;
    switch (platform) {
        case 'sc':
            stream = await Soundcloud.download(url);
            break;
        case 'bc':
            var info = await Bandcamp.getTrackInfo(url);
            stream = (await require('node-fetch')(info.streamUrl)).body;
            break;
        default:
            stream = Youtube(url, {
                highWaterMark: 16384,
                dlChunkSize: 2048,
                liveBuffer: 10000
            });
    }
    connection.play(Prism.convert(stream), {
        type: 'opus'
    }).on("finish", () => {
        _txt.edit(`${_txt.content} (Completed)`);
        connection.disconnect();
    });
}

module.exports = {
    play
}