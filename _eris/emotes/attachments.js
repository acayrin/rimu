const Eris = require('eris');

module.exports.attachments = (message, fix) => {
    let files = [];
    const list = message.attachments;
    (async function loop() {
        for (i = 0; i < list.length; i++) {
            const e = list[i];
            await require('node-fetch')(e.url).then(f => f.buffer()).then(buffer => {
                const file = {
                    name: e.url.split('/')[e.url.split('/').length - 1],
                    file: buffer,
                };
                files.push(file);
                if (i + 1 === list.length) require('./send').send(message, fix, files);
            });
        }
    })();
};