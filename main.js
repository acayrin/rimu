// acay's shit bot
// @acayrin
// ver: 1.0

const ver = "1.0";
const Discord = require('discord.js');
const client = new Discord.Client();

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

client.login('Nzk1NjE4MTgxNTM2MDIyNTMw.X_L_LA.Dsy0CA9Qg0LHitJWKL99CVWwXq0');

client.on('message', async (message) => {
	const list = message.content.match(/(:(?![\n])[()#$@-\w]+:)/g);
	if (list && !message.author.bot) {
		let fix = message.content;
		let diff = false;

		// replace emotes
		for(match of uniq_fast(list)) {
			const emoji = client.emojis.cache?.find(emoji => emoji.name === match.replace(/:/g,""));

			// check if from same servers
			if (client.emojis.cache?.find(emoji => emoji.name === match.replace(/:/g,"")) != null)
			if ((emoji.guild.id == message.channel.guild.id && emoji.animated)	|| emoji.guild.id !== message.channel.guild.id) {
				fix = fix.replace(new RegExp(match, 'g'), `<${emoji.identifier}>`);
				diff = true;
			}
		}

		// webhook
		if (diff) {
			let webhook = await message.channel.createWebhook(message.member.displayName, {avatar: message.author.avatarURL()});
			await webhook.edit({channel: message.channel.id});
			await webhook.send(fix);
			await message.delete();
			await webhook.delete().catch(console.error);
		}
	}
});


function uniq_fast(a) {
    var seen = {};
    var out = [];
    var len = a.length;
    var j = 0;
    for(var i = 0; i < len; i++) {
         var item = a[i];
         if(seen[item] !== 1) {
               seen[item] = 1;
               out[j++] = item;
         }
    }
    return out;
}
