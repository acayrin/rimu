module.exports = {
    ReactionCollector: require("../../_eris/libs/collector/ReactionCollector"),
    MessageCollector: require("../../_eris/libs/collector/MessageCollector"),
    embedBuilder: require('../../_eris/libs/eris/embedBuilder').Embed,
    send: require('../../_eris/libs/eris/sendMessage').send,
    getChannel: require('../../_eris/libs/eris/getChannel').getChannel
}