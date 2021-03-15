async function getChannel(channelID) {
    return require('../../Rimu').client.getChannel(channelID);
};

module.exports = {
    getChannel
}