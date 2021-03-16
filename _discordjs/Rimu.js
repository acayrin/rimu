const {
  log
} = require('./etc/utils');

const config = require('./rimu/config'),
  Discord = require('discord.js'),
  client = new Discord.Client(),
  port = process.env.PORT || 42069,
  revision = require('child_process').execSync(`git ls-remote https://${config.gitUser}:"${config.gitPass}"@github.com/Acayrin/acay-s-bot/ | head -1 | sed "s/HEAD//"`).toString().trim().substring(0, 10);
const _cf = require('child_process').spawn(`${__dirname}/etc/cloudflared`, ['--cred-file', `${__dirname}/rimu/cert.pem`, '--hostname', 'rimu.ml', '--url', `http://localhost:${port}`, '--loglevel', 'fatal']);

module.exports.client = client;
module.exports.scID = config.scID;
module.exports.gnID = config.gnID;
module.exports.reID = config.reID;
module.exports.ver = config.ver;
module.exports.revision = revision;
module.exports.cloudflared = _cf;
module.exports.port = port;

require('./rimu/preinstall').run();

client.login(config.dsID);

client.once('ready', () => {
  client.user.setPresence({
    status: 'online',
    activity: {
      name: `Current commit: #${revision}`
    }
  });

  require('./rimu/task').task(client);

  require('./rimu/console').cmd(client);

  require('./web').startWebServer();

  log(`Enabled Rimu v${config.ver}`);
  if (!_cf.pid)
    log(`Cloudflare died!`, 1);
});

client.on('message', message => {
  require('./emotes/main').gproc(message);
  require('./cmd/main').cproc(message);
});

// kill on SIGTERM
process.on('SIGTERM', () => {
  log(`Shutting down. Goodbye...`);
  _cf.stdout.pause();
  _cf.kill();
  client.destroy();
  process.exit();
});