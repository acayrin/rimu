const {
    uniq_fast
} = require('../etc/utils');
const Rimu = require('../Rimu');

module.exports.gproc = (message) => {
    const _list = Rimu.emotes;

    const list = message.content.match(/(:(?![\n])[()#$@-\w]+:)/g);
    if (list && !message.author.bot) {
        let fix = message.content;
        let diff = false;

        // replace emotes
        _list.forEach(guild => {
            for (match of uniq_fast(list)) {
                const emoji = guild.emotes.find(emoji => emoji.name === match.replace(/:/g, ""));

                if (!emoji || (!emoji.animated && guild.id === message.member.guild.id)) continue;

                if (emoji.animated) {
                    fix = fix.replace(new RegExp(match, 'g'), `<a:${emoji.name}:${emoji.id}>`);
                    diff = true;
                } else {
                    fix = fix.replace(new RegExp(match, 'g'), `<:${emoji.name}:${emoji.id}>`);
                    diff = true;
                };
            };
        });

        // if different
        if (!diff) return;

        if (message.attachments.length)
            // if there are attachments
            require('./attachments').attachments(message, fix);
        else
            // normal send
            require('./send').send(message, fix);
    }
};