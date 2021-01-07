const fetch = require('node-fetch');
const utf8 = require('utf8');
const discord = require('discord.js');

function fetchIMG(message, subreddit) {
  const search = (subreddit) ? subreddit : "memes";
  fetch(`https://www.reddit.com/r/${search}/top.json?sort=top&t=month&limit=1000`)
      .then(res => res.json())
      .then(out => {
        const rng = Math.floor(Math.random() * out.data.children.length);
        const json = out.data.children[rng].data;
           //prevent video       //only images                  //prevent gallery
        if(!json.secure_media && json.url_overridden_by_dest && !json.is_gallery) {
          const embed = new discord.MessageEmbed()
            .setColor('#e3b900')
            .setTitle(json.title)
            .setURL("https://www.reddit.com" + json.permalink)
            .setAuthor("r/" + search)
            .setImage(json.url_overridden_by_dest)
          return message.channel.send(embed);
        } else
          return fetchIMG(message, subreddit)
      })
}

module.exports = (message, subreddit) => {
  return fetchIMG(message, subreddit);
};
