const q = new Map();

function queue() {
    return q;
}

function makeSong(title, artist, url, duration, thumbnail, requester) {
    return {
        title: title,
        author: artist,
        url: url,
        duration: duration,
        thumbnail: thumbnail,
        requester: requester
    };
}

function makeQueue(textChannel, voiceChannel, _volume, _repeat) {
    return {
        textChannel: textChannel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: _volume ? _volume : 5,
        repeat: _repeat ? _repeat : 0,
        playing: true
    };
}

function pushGuild(guildID, guildQueue) {
    return q.set(guildID, guildQueue)
}

function getQueue(guildID) {
    return q.get(guildID)
}

function pushSong(guildID, song) {
    return getQueue(guildID).songs.push(song);
}

module.exports = {
    makeSong,
    makeQueue,
    getQueue,
    pushGuild,
    pushSong,
    queue
}