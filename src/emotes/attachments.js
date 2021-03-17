const {
  MessageAttachment
} = require('discord.js');

module.exports.attachments = (message, fix) => {
  let files = [];
  const list = message.attachments.array();

  (async function loop() {
    for (i = 0; i < list.length; i++) {
      const e = list[i];
      await require('node-fetch')(e.url).then(f => f.buffer()).then(z => {
        const url = new MessageAttachment(z, e.url.split('/')[e.url.split('/').length - 1]);
        files.push(url);
        if (i + 1 === list.length) require('./send').send(message, fix, files);
      });
    }
  })();
};