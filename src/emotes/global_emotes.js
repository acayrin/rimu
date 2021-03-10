const {
  uniq_fast,
  log
} = require('../etc/utils');

module.exports.gproc = (client, message) => {
  const list = message.content.match(/(:(?![\n])[()#$@-\w]+:)/g);
  if (list && !message.author.bot) {
    let fix = message.content;
    let diff = false;

    // replace emotes
    for (match of uniq_fast(list)) {
      const emoji = client.emojis.cache.find(emoji => emoji.name === match.replace(/:/g, ""));

      // check if from same servers
      if (client.emojis.cache.find(emoji => emoji.name === match.replace(/:/g, "")) != null)
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

function send(message, msg) {
  try {
    let webhook;
    message.channel.fetchWebhooks().then(async webhooks => {
      for (i = 0; i < webhooks.array().length; i++)
        if (webhooks.array()[i].name === 'Hod')
          webhook = webhooks.array()[i];

      // If hook not found
      if (!webhook)
        webhook = await message.channel.createWebhook("Hod", {
          avatar: message.client.user.avatarURL()
        });

      if (!message.deleted) message.delete();

      webhook.send(msg, {
        username: message.member.displayName,
        avatarURL: message.author.avatarURL(),
        channel: message.channel.id
      }).then(react => {
        const filter = (reaction, user) => {
          return ['❌'].includes(reaction.emoji.name) && user.id === message.author.id;
        };
        react.awaitReactions(filter, {
            max: 1,
            time: 1728000,
            errors: ['time']
          })
          .then(e => {
            log(`User deleted bot message ID:${react.id}`);
            react.delete();
          })
      });
    })
  } catch (error) {
    send(message, msg);
  }
}