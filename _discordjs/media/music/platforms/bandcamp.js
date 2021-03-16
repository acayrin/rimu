const bcs = require('bandcamp-scraper');
const bcf = require('bandcamp-fetch');
const deasync = require('deasync');

let list = [];

async function searchUrl(query) {
    const info = await bcf.getTrackInfo(query);
    return {
        title: info.name,
        artist: info.artist.name,
        url: info.streamUrl,
        thumbnail: info.imageUrl,
        duration: require('../../../etc/utils').time_format(Math.round(info.duration))
    }
}

async function search(search, _limit) {
    return searchAll(search, 1, _limit);
}

function searchAll(search, _page, _limit) {
    let res = null;
    bcs.search({
        query: search,
        page: _page ? _page : 1
    }, (error, searchResults) => {
        if (error) {
            console.log(error);
            return null;
        } else {
            searchResults.forEach(track => {
                if (track.type === 'track')
                    list.push(track);
            });
            res = searchResults;
        }
    });
    // complete async task
    while (res == null)
        deasync.runLoopOnce();
    // continue searching
    if (res.length !== 0 && list.length < _limit)
        return searchAll(search, _page ? _page + 1 : 2, _limit);
    else if (list.length > _limit)
        return list.slice(0, _limit);
    else
        return list;
}

module.exports = {
    search,
    searchUrl
}