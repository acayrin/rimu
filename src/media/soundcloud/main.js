const {
    log,
    shuffleArray,
    isValidURL,
    time_format,
} = require('../../etc/utils');
const Main = require('../../main.js');

const scdl = require('soundcloud-downloader').create({
    clientID: Main.scID
});
module.exports.soundcloud = scdl.search({
    limit: 1,
    resourceType: 'tracks',
    query: 'tilarids'
}).then(async out => {
    const channel = Main.client.channels.cache.get('795720004002775170');
    var connection = await channel.join();
    var song = await scdl.download(out.collection[0].permalink_url);
    var out = require('fluent-ffmpeg')(song, {
            'niceness': 20
        })
        .noVideo()
        .audioCodec('libopus')
        .format('ogg')
        .audioBitrate(128)
        .on('end', log('Completed processing.'))
        .pipe();
    connection
        .play(out)
        .on("finish", () => {
            connection.disconnect()
        })
});