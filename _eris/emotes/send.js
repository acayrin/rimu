const Rimu = require('../Rimu').client;

module.exports.send = (message, msg, _files) => {
    try {
        let webhook;
        Rimu.getChannelWebhooks(message.channel.id).then(async webhooks => {
            webhooks.forEach(hook => {
                if (hook.name === 'Rimu') webhook = hook;
            });

            // If hook not found
            if (!webhook) webhook = await Rimu.createChannelWebhook(message.channel.id, {
                name: 'Rimu',
                avatar: Rimu.user.avatarURL
            });

            message.delete();

            Rimu.executeWebhook(webhook.id, webhook.token, {
                auth: true,
                avatarURL: message.member.avatarURL,
                username: message.member.nick ? message.member.nick : message.member.username,
                content: msg,
                file: _files
            });
        });
    } catch (error) {
        send(message, msg, _files);
    }
};