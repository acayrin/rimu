const redis = require('./redis').redis();

function task(client) {
    // redis
    setInterval(() => {
        redis.set('h_cpu', require('child_process').execSync(`ps up "${process.pid}" | tail -n1 | tr -s ' ' | cut -f3 -d' '`));
        redis.set('d_guild', client.guilds.size);
        redis.set('d_user', client.users.size);
    }, 5000);

    setInterval(() => {
        presence(client, `Current commit: #${require('../Rimu').revision}`);
        setTimeout(() => {
            presence(client, `Server: ${client.guilds.size} - User: ${client.users.size}`);
        }, 5000);
    }, 10000);
}

async function presence(client, string) {
    await client.editStatus('online', {
        name: string,
        type: 3
    });
}

module.exports = {
    task
}