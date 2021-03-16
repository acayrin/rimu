const {
  log
} = require('./etc/utils');

const config = require('./rimu/config');
const Discord = require('discord.js');
const client = new Discord.Client();
const publicIp = require('public-ip');

const revision = require('child_process').execSync(`git ls-remote https://${config.gitUser}:"${config.gitPass}"@github.com/Acayrin/acay-s-bot/ | head -1 | sed "s/HEAD//"`).toString().trim().substring(0, 10);

module.exports.client = client;
module.exports.scID = config.scID;
module.exports.gnID = config.gnID;
module.exports.reID = config.reID;
module.exports.ver = config.ver;
module.exports.revision = revision;

require('./rimu/preinstall').run();

client.login(config.dsID);

client.once('ready', () => {
  log(`Enabled Rimu v${config.ver}`);

  client.user.setPresence({
    status: 'online',
    activity: {
      name: `Current commit: #${revision}`
    }
  });

  require('./rimu/task').task(client);

  require('./rimu/console').cmd(client);
  (async () => {
    console.log(await publicIp.v4());
    //=> '46.5.21.123'

    console.log(await publicIp.v6());
    //=> 'fe80::200:f8ff:fe21:67cf'
  })();
});
client.on('message', message => {
  require('./emotes/main').gproc(message);
  require('./cmd/main').cproc(message);
});