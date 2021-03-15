const {
    log
} = require('../../etc/utils');
const fetch = require('node-fetch'),
    Rimu = require('../../Rimu'),
    EmbedBuilder = require('../../libs/lib').embedBuilder,
    Lib = require('../../libs/lib');

function reddit(message, subreddit) {
    const list = ['memes', 'dankmemes', 'funny', 'wholesomememes'],
        top = ['day', 'week', 'month'];

    const search = subreddit ? subreddit : list[Math.floor(Math.random() * list.length)],
        topl = top[Math.floor(Math.random() * top.length)];

    fetch(`https://www.reddit.com/r/${search}/top.json?sort=top&t=${topl}&limit=100`, {
        compress: true
    }).then(res => res.json()).then(out => {
        while (true) {
            const rng = Math.floor(Math.random() * out.data.children.length),
                json = out.data.children[rng].data;

            if (!json.secure_media && json.is_reddit_media_domain && json.url_overridden_by_dest && !json.is_gallery) {
                const embed = new EmbedBuilder();
                embed.setTitle(json.title);
                embed.setColor(0xe3b900);
                embed.setURL(`https://www.reddit.com${json.permalink}`);
                embed.setAuthor(`r/${search}`);
                embed.setImage(json.url_overridden_by_dest);
                embed.setFooter(`👍 ${json.ups}   ` + (json.total_awards_received ? `🏅 ${json.total_awards_received}` : ''));

                return Lib.send(message.channel.id, '', embed);
            } else log(`https://www.reddit.com${json.permalink} does not have a valid image`);
        }
    }).catch(e => {
        console.log(e)
        Rimu.client.createMessage(message.channel.id, {
            content: `Unable to fetch image. Please try again later.`
        });
    });
}

module.exports = {
    reddit
};