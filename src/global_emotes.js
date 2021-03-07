require('./utils')();

module.exports = function() {
  this.ge_proc = async function (client, message) {
    const list = message.content.match(/(:(?![\n])[()#$@-\w]+:)/g);
    if (list && !message.author.bot) {
      let fix = message.content;
      let diff = false;

      // replace emotes
      for(match of uniq_fast(list)) {
        const emoji = client.emojis.cache.find(emoji => emoji.name === match.replace(/:/g,""));

        // check if from same servers
        if (client.emojis.cache.find(emoji => emoji.name === match.replace(/:/g,"")) != null)
        if (emoji.animated) {
          fix = fix.replace(new RegExp(match, 'g'), `<${emoji.identifier}>`);
          diff = true;
        } else if (emoji.guild.id !== message.channel.guild.id) {
          fix = fix.replace(new RegExp(match, 'g'), `<:${emoji.identifier}>`);
          diff = true;
        }
      }

      // webhook
      if (diff) {
        send(message, fix);
      }
    }
  }
}

async function send(message, msg) {
  try {
    const webhooks = await message.channel.fetchWebhooks();
    let webhook = webhooks.first();
    if(!webhook)
      webhook = await message.channel.createWebhook("Hod-webhook", {avatar: message.client.user.avatarURL(), reason: 'Create Hod-webhook'});

    message.delete();
    await webhook.send(msg, {
      username: message.member.displayName,
      avatarURL: message.author.avatarURL(),
      channel: message.channel.id
    });
  } catch (error) {
    console.error('Error trying to send: ', error);
    send(message, msg);
  }
}
