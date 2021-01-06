// acay's shit bot
// @acayrin
// ver: 1.0.4
require('./src/global_emotes')();
require('./src/command_handler')();

const ver = "1.0.4";
const Discord = require('discord.js');
const client = new Discord.Client();
// global var
const queue = new Map();
exports.queue = queue;
// end of global var

client.login('Nzk1NjE4MTgxNTM2MDIyNTMw.X_L_LA.Dsy0CA9Qg0LHitJWKL99CVWwXq0');
client.once('ready', () => {
	console.log("> Enabled acay's toy v" + ver);
	client.user.setPresence({
    status: 'online',
    activity: {
      name: client.users.cache.size + " users + " + client.guilds.cache.size + " servers",
      type: 'WATCHING',
    }
	})
});

client.on('message', async message => {
	await ge_proc(client, message);
	await cmd_proc(message);
});
