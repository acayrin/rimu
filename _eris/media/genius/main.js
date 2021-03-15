const {
    searchSong,
    getLyrics
} = require('../../libs/genius-lyrics-api/index');
const {
    gnID
} = require('../../Rimu');
const Lib = require('../../libs/lib');

module.exports.lyrics = async (message, args) => {
    const options = {
        apiKey: gnID,
        title: args,
        artist: '',
        optimizeQuery: false
    };

    let check = await Lib.send(message.channel.id, `Searching ...`);

    await searchSong(options).then(async songs => {
        let promises = [];

        songs.forEach(song => {
            promises.push(Promise.resolve(getLyrics(song.url)));
        })

        Promise.all(promises).then(list => {
            for (i = 0; i < list.length; i++) {
                if (list[i].length > 4000) continue;

                check.edit(`${message.author.mention} Result for **${args}**`);

                let p = list[i];
                let segments = p.split('\n');
                let merge = ' ';

                for (x = 0; x < segments.length; x++)
                    if (merge.length + ('\n' + segments[x]).length > 500) {
                        Lib.send(message.channel.id, merge);
                        merge = ' ';
                    } else if (!segments[x].trim()) merge += '\n> \u200B'
                else merge += '\n> ' + segments[x];

                Lib.send(message.channel.id, merge);
                return;
            }
        });
    });
};