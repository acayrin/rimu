const ytsr = require('ytsr');

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

module.exports = {
    search
}