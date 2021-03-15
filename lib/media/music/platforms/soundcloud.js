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

module.exports = {
    search
}