async function send(channel, message, _embed) {
    return await require('../../Rimu').client.createMessage(channel, {
        content: message,
        embed: _embed
    });
};

module.exports = {
    send
}