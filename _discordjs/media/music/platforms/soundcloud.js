const scdl = require('soundcloud-downloader').create({
    clientID: require('../../../Rimu').scID
});

async function search(query, _limit) {
    const res = await scdl.search({
        query: query,
        limit: _limit ? _limit : 10,
        resourceType: 'tracks'
    }).catch(e => {
        console.log(e);
        return null;
    })

    return res.collection;
}

async function searchUrl(query) {
    const info = await scdl.getInfo(query).catch(e => {
        console.log(e);
        return null;
    });
    return {
        title: info.title,
        artist: info.user.username,
        url: info.permalink_url,
        thumbnail: info.artwork_url ? info.artwork_url : info.user.avatar_url,
        duration: require('../../../etc/utils').time_format(Math.round(info.full_duration / 1000))
    }
}

module.exports = {
    search,
    searchUrl
}