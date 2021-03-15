const Rimu = require('../Rimu'),
    Media = require('../media/music/search'),
    Genius = require('../media/genius/main'),
    Reddit = require('../media/reddit/reddit');

const prefix = "=";

module.exports.cproc = async message => {
    //const serverQueue = require('../media/music/queue').getQueue(message.guild.id);

    // skip if isn't command or message from bot
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    // parsing
    const check = message.content.slice(prefix.length).trim(),
        command = check.split(" ").shift().toLowerCase(),
        args = check.slice(command.length).trim();

    if (command === 'help' || command === 'h') {
        return Rimu.client.createMessage(message.channel.id, {
            embed: {
                title: '**Command list**',
                color: 0xe3b900,
                fields: [{
                    name: '**Help**',
                    value: '`=h || =help` show this main page',
                    inline: true
                }],
                footer: {
                    text: 'by acay#9388'
                }
            }
        });
    }
    if (command === 'play') {
        return Media.search(args, message, true);
    }
    if (command === 'search') {
        return Media.search(args, message);
    }
    if (command === 'skip') {
        return Youtube.skip(message, serverQueue);
    }
    if (command === 'stop') {
        return Youtube.stop(message, serverQueue);
    }
    if (command === 'shuffle') {
        return Youtube.shuffle(message, serverQueue);
    }
    if (command === 'config') {
        return Youtube.config(message, args, serverQueue);
    }
    if (command === 'q') {
        return Youtube.control(message, serverQueue);
    }
    if (command === 'reddit') {
        Reddit.reddit(message, args ? args : null);
    }
    if (command === 'lyrics') {
        Genius.lyrics(message, args);
    }
};