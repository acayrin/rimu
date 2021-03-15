const {
  uniq_fast
} = require('../etc/utils');

module.exports.gproc = (message) => {
  const client = message.client;
  const list = message.content.match(/(:(?![\n])[()#$@-\w]+:)/g);
  if (list && !message.author.bot) {
    let fix = message.content;
    let diff = false;

    // replace emotes
    for (match of uniq_fast(list)) {
      const emoji = client.emojis.cache.find(emoji => emoji.name === match.replace(/:/g, ""));

      // if emoji doesnt exist
      if (!emoji) return;

      // check if from same servers
      if (client.emojis.cache.find(emoji => emoji.name === match.replace(/:/g, "")) != null && emoji.animated) {
        fix = fix.replace(new RegExp(match, 'g'), `<${emoji.identifier}>`);
        diff = true;
      } else if (emoji.guild.id !== message.channel.guild.id) {
        fix = fix.replace(new RegExp(match, 'g'), `<:${emoji.identifier}>`);
        diff = true;
      }
    }
    // if different
    if (!diff) return;

    if (message.attachments.array().length)
      // if there are attachments
      require('./attachments').attachments(message, fix);
    else
      // normal send
      require('./send').send(message, fix);
  }
};