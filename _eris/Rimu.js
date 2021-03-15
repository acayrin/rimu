const {
    log
} = require('./etc/utils');
const _config = require('./rimu/config'),
    Eris = require('eris'),
    client = new Eris(_config.dsID, {
        compress: false,
        messageLimit: 500,
        defaultImageFormat: 'png',
        connectionTimeout: 60 * 1000,
        maxShards: 'auto',
        requestTimeout: 30 * 1000,
        seedVoiceConnections: true
    });

const _revision = require('child_process').execSync(`git ls-remote https://${_config.gitUser}:"${_config.gitPass}"@github.com/Acayrin/acay-s-bot/ | head -1 | sed "s/HEAD//"`).toString().trim().substring(0, 10);
const _emotes = [];

module.exports.client = client;
module.exports.scID = _config.scID;
module.exports.gnID = _config.gnID;
module.exports.reID = _config.reID;
module.exports.ver = _config.ver;
module.exports.revision = _revision;
module.exports.emotes = _emotes;

require('./rimu/preinstall').run();

client.on('ready', () => {
    client.editStatus('online', {
        name: `Server: ${client.guilds.size} - User: ${client.users.size}`,
        type: 3
    });

    require('./rimu/task').task(client);
    require('./rimu/console').cmd(client);

    client.guilds.forEach(guild => {
        let _list = [];
        guild.emojis.forEach(emote => {
            _list.push(emote);
        });
        _emotes.push({
            id: guild.id,
            emotes: _list
        });
    });

    log(`Enabled Rimu v${_config.ver}`);
});
client.on('messageCreate', message => {
    if (message.author.bot) return;

    require('./emotes/emotes').gproc(message);
    require('./cmd/main').cproc(message);
});
client.connect();

process.on('SIGTERM', () => {
    log(`Shutting down. Goodbye...`);
    require('../Rimu').client.disconnect();
    process.exit();
})