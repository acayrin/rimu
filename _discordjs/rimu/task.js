const redis = require('./redis').redis();

function task(client) {
  // redis
  client.setInterval(() => {
    redis.set('h_cpu', require('child_process').execSync(`ps up "${process.pid}" | tail -n1 | tr -s ' ' | cut -f3 -d' '`));
    redis.set('d_guild', client.guilds.cache.size);
    redis.set('d_user', client.users.cache.size);
  }, 1000);

  client.setInterval(() => require('../etc/utils').log(`Sweeped ${client.sweepMessages(900)} messages`), 900 * 1000);

  /*client.setInterval(() => {
    presence(client, `Current commit: #${require('../Rimu').revision}`);
    client.setTimeout(() => {
      presence(client, `Server: ${client.guilds.cache.size} - User: ${client.users.cache.size}`);
    }, 5000);
  }, 10000);*/
  client.setInterval(() => {
    require('node-fetch')('https://rimu.herokuapp.com/').then(e => {
      require('../etc/utils').log('Pinged webserver');
    });
  }, 300 * 1000);
}

async function presence(client, string) {
  await client.user.setPresence({
    status: 'online',
    activity: {
      name: string
    }
  });
}

module.exports = {
  task
}