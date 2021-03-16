const ytsr = require('ytsr'),
    ytdl = require('ytdl-core'),
    utils = require('../../../etc/utils');

async function search(query, _limit) {
    const f1 = await ytsr.getFilters(query).catch(e => {
        console.log(e);
        return null;
    });
    const f2 = f1.get('Type').get('Video');

    const res = await ytsr(f2.url, {
        limit: _limit ? _limit : 10
    }).catch(e => {
        console.log(e);
        return null;
    });

    return res['items'];
}

async function searchUrl(query) {
    const info = (await ytdl.getBasicInfo(query)).videoDetails;
    return {
        title: info.title,
        artist: info.ownerChannelName,
        url: info.video_url,
        thumbnail: info.thumbnails[info.thumbnails.length - 2].url,
        duration: utils.time_format(info.lengthSeconds)
    }
}

module.exports = {
    search,
    searchUrl
}