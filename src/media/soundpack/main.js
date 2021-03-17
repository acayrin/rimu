const _folder = `${__dirname}/tracks`;
const fs = require('fs');

async function play(track, message) {
    if (!message.member.voice.channel)
        return message.channel.send('No voice channel to play');

    if (!fs.existsSync(`${_folder}/${track}`))
        return message.channel.send('Track not found');

    let connection = null;
    
    try {
        connection = await message.member.voice.channel.join();
    } catch (e) {
        connection.disconnect();
        connection = await message.member.voice.channel.join();
    }

    connection.play(`${_folder}/${track}`).on('finish', e => {
        connection.disconnect();
    })
}

function list(_message) {
    const _t = new Map();
    fs.readdir(_folder, (_err, files) => {
        for (let i = 0; i < files.length; i++) {
            _t.set(i + 1, `${_folder}/${files[i]}`);
        }
        return !_message ? _t :
            _message.channel.send(`**Available sounds**: ${files.toString()}`)
    });
}

module.exports = {
    list,
    play
}