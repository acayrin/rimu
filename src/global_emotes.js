require('./utils')();

module.exports = function() {
  this.ge_proc = async function (client, message) {
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
  }
}
