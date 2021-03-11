const {
  log,
  time_format
} = require('./etc/utils')
const {
  gproc
} = require('./emotes/global_emotes')
const {
  cproc
} = require('./cmd/command_handler')
const Discord = require('discord.js')
const client = new Discord.Client()

const scID = '8VYpK2wS7aOYHwRFi4wZE1P51Z00WaeR'
const gnID = 'cTvBBYPzs4M-1rA97lno6mpep-l-eh2W-j5u8jdW9CtunPgX_ZSJRInZ8E46YuG9'
const dsID = 'Nzk1NjE4MTgxNTM2MDIyNTMw.X_L_LA.Dsy0CA9Qg0LHitJWKL99CVWwXq0'
const gitUser = 'Acayrin'
const gitPass = 'Kimbang012!'
const sweepMax = 3600

const queue = new Map()
module.exports.queue = queue
module.exports.client = client
module.exports.scID = scID
module.exports.gnID = gnID
// end of global var

const revision = require('child_process')
  .execSync(`git ls-remote https://${gitUser}:"${gitPass}"@github.com/Acayrin/acay-s-bot/ | head -1 | sed "s/HEAD//"`)
  .toString().trim().substring(0, 10)

if (!require('fs').existsSync(require('ffmpeg-static'))) {
  log('FFmpeg not found. Installing ...')
  require('child_process').execSync('node node_modules/ffmpeg-static/install.js')
}

client.once('ready', () => {
  log(`Enabled Rimu #${revision}`)

  // sweep messages every hour
  client.setInterval(() =>
    log(`Sweeped ${client.sweepMessages(sweepMax)} messages`), 3600000)

  presence(`Current commit: #${revision}`)
  client.setInterval(() => {
    presence(`Current commit: #${revision}`)
    client.setTimeout(async () => {
      presence(`Server: ${client.guilds.cache.size} - User: ${client.users.cache.size}`)
    }, 5000)
  }, 10000)

  // command line interface
  cmd()

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

client.login(dsID)

function cmd() {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  })
  readline.question('', e => {
    if (e === 'off') {
      log(`Shutting down. Goodbye...`)
      client.destroy()
      process.exit()
    }
    if (e === 'uptime')
      log(`Uptime ${time_format(process.uptime())}`, 1)
    if (e === 'ver' || e === 'version') {
      const exec = require('child_process')
      const cpu = exec.execSync(`ps up "${process.pid}" | tail -n1 | tr -s ' ' | cut -f3 -d' '`)
      const ffmpeg = exec.execSync("ffmpeg -version | grep 'ffmpeg version' | sed -e 's/ffmpeg version //' -e 's/[^-0-9.].*//'")
      const node = exec.execSync('node --version')
      const npm = exec.execSync('npm -version')
      log(`\nCPU: ${cpu}\nFFmpeg version${ffmpeg}NPM version ${npm}Node.JS version ${node}`, 1)
    }
    if (e === 'sweep') {
      log(`Sweeped ${client.sweepMessages(sweepMax)} messages`, 1)
    }
    readline.close()
    cmd()
  })
}

async function presence(string) {
  await client.user.setPresence({
    status: 'online',
    activity: {
      name: string
    }
  })
}