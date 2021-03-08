require('../utils')();
const fetch = require('node-fetch');
const discord = require('discord.js');

function fetchIMG(message, subreddit) {
  const search = (subreddit) ? subreddit : "memes";
  fetch(`https://www.reddit.com/r/${search}/top.json?sort=top&t=week&limit=500`)
      .then(res => res.json())
      .then(out => {
        while (true) {
          const rng = Math.floor(Math.random() * out.data.children.length);
          const json = out.data.children[rng].data;
          if (!json.secure_media && json.is_reddit_media_domain && json.url_overridden_by_dest && !json.is_gallery) {
            const embed = new discord.MessageEmbed()
              .setColor('#e3b900')
              .setTitle(json.title)
              .setURL(`https://www.reddit.com${json.permalink}`)
              .setAuthor(`r/${search}`)
              .setImage(json.url_overridden_by_dest)
              .setFooter(`👍 ${json.ups}`)
            return message.channel.send(embed);
          } else
            log(`https://www.reddit.com${json.permalink} does not have a valid image`);
        }
      })
}

module.exports = (message, subreddit) => {
  return fetchIMG(message, subreddit);
};
