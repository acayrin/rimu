const {
  searchSong,
  getLyrics
} = require('genius-lyrics-api');

const {
  gnID
} = require('../../Rimu');

module.exports.lyrics = async (message, args) => {
  const options = {
    apiKey: gnID,
    title: args,
    artist: '',
    optimizeQuery: false
  };
  let check = await message.channel.send(`Searching ...`);
  await searchSong(options).then(async songs => {
    let promises = [];

    for (i = 0; i < songs.length; i++) {
      promises.push(Promise.resolve(getLyrics(songs[i].url)));
    }

    Promise.all(promises).then(list => {
      for (i = 0; i < list.length; i++) {
        if (list[i].length > 4000) continue;
        check.edit(`${message.author.toString()} Result for **${args}**`);
        let p = list[i];
        let segments = p.split('\n');
        let merge = ' ';

        for (x = 0; x < segments.length; x++) {
          if (merge.length + ('\n' + segments[x]).length > 500) {
            message.channel.send(merge);
            merge = ' ';
          } else if (!segments[x].trim()) merge += '\n> \u200B';else merge += '\n> ' + segments[x];
        }

        message.channel.send(merge);
        return;
      }
    });
  });
};