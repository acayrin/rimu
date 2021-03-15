module.exports.send = (message, msg, _files) => {
    try {
        let webhook;
        message.channel.fetchWebhooks().then(async webhooks => {
            for (i = 0; i < webhooks.array().length; i++) if (webhooks.array()[i].name === 'Hod') webhook = webhooks.array()[i];

            // If hook not found
            if (!webhook) webhook = await message.channel.createWebhook("Hod", {
                avatar: message.client.user.avatarURL()
            });

            if (!message.deleted) message.delete();

            webhook.send(msg, {
                username: message.member.displayName,
                avatarURL: message.author.avatarURL(),
                channel: message.channel.id,
                files: _files
            }).then(react => {
                const filter = (reaction, user) => ['❌'].includes(reaction.emoji.name) && user.id === message.author.id;
                const collector = react.createReactionCollector(filter);

                // remove after 6 hours
                const timeOut = message.client.setTimeout(() => {
                    collector.stop();
                }, 21600000);

                collector.on('collect', (reaction, user) => {
                    react.delete();
                    collector.stop();
                    clearTimeout(timeOut);
                });
            });
        });
    } catch (error) {
        send(message, msg, _files);
    }
};