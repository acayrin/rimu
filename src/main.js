const {
  log
} = require('./etc/utils')
const {
  gproc
} = require('./emotes/global_emotes')
const {
  cproc
} = require('./cmd/command_handler')
const Discord = require('discord.js')
const client = new Discord.Client()
// global var

const queue = new Map()
const scID = '8VYpK2wS7aOYHwRFi4wZE1P51Z00WaeR'
const gnID = 'cTvBBYPzs4M-1rA97lno6mpep-l-eh2W-j5u8jdW9CtunPgX_ZSJRInZ8E46YuG9'
module.exports.queue = queue
module.exports.client = client
module.exports.scID = scID
module.exports.gnID = gnID
// end of global var

const revision = require('child_process')
  .execSync('git ls-remote https://Acayrin:"Kimbang012!"@github.com/Acayrin/acay-s-bot/ | head -1 | sed "s/HEAD//"')
  .toString().trim().substring(0, 10)

client.login('Nzk1NjE4MTgxNTM2MDIyNTMw.X_L_LA.Dsy0CA9Qg0LHitJWKL99CVWwXq0')

client.once('ready', () => {
  log(`Enabled Hod #${revision}`)
  presence(`Current commit: #${revision}`)
  setInterval(() => {
    presence(`Current commit: #${revision}`)
    setTimeout(async () => {
      presence(`Server: ${client.guilds.cache.size} - User: ${client.users.cache.size}`)
    }, 5000)
  }, 10000)

  // Soundcloud test [success] - 
  //require('./media/soundcloud/main').soundcloud
  // Bandcamp test [success]
  /**
  const bcs = require('bandcamp-scraper')
  const bcf = require('bandcamp-fetch')
  const params = {
    query: 'pretty little death',
    page: 1
  }

  bcs.search(params, function (error, searchResults) {
    if (error) {
      console.log(error)
    } else {
      for (i = 0 i < searchResults.length i++) {
        if (searchResults[i].type === 'track') {
          bcf.getTrackInfo(searchResults[i].url).then(async out => {
            // test channel
            const channel = client.channels.cache.get('795720004002775170')
            // connect voicechat
            var connection = await channel.join()
            // user https instead of node-fetch
            const https = require('https')
            https.get(out.streamUrl, res => {
              var out = require('fluent-ffmpeg')(res).noVideo().audioCodec('libopus').format('ogg').audioBitrate('64').pipe()
              connection
                .play(out)
                .on("finish", () => {
                  connection.disconnect()
                })
            })
          })
          return
        }
      }
    }
  })
  **/
})

client.on('message', message => {
  gproc(client, message)
  cproc(message)
})

async function presence(string) {
  await client.user.setPresence({
    status: 'online',
    activity: {
      name: string
    }
  })
}