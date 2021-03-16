const {
    log
} = require('../etc/utils');

function cmd(client) {
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    readline.question('', e => {
        if (!e.startsWith("/")) {
            readline.close();
            return cmd();
        }

        e = e.slice("/".length);

        if (e === 'exit') {
            log(`Shutting down. Goodbye...`);
            require('../Rimu').client.destroy();
            require('../Rimu').cloudflared.stdout.pause();
            require('../Rimu').cloudflared.kill();
            process.exit();
        };

        if (e === 'uptime') log(`Uptime ${time_format(process.uptime())}`, 1);

        if (e === 'ver' || e === 'version') {
            const exec = require('child_process');

            const cpu = exec.execSync(`ps up "${process.pid}" | tail -n1 | tr -s ' ' | cut -f3 -d' '`);
            const ffmpeg = exec.execSync("ffmpeg -version | grep 'ffmpeg version' | sed -e 's/ffmpeg version //' -e 's/[^-0-9.].*//'");
            const node = exec.execSync('node --version');
            const npm = exec.execSync('npm -version');
            log(`\n========== Rimu v${require('../Rimu').ver} ==========\n\nCPU: ${cpu} %\nFFmpeg version ${ffmpeg}NPM version ${npm}Node.JS version ${node}\n=================================`, 1);
        }

        if (e === 'sweep') {
            log(`Sweeped ${client.sweepMessages(sweepMax)} messages`, 1);
        }
        readline.close();
        cmd();
    });
}

module.exports = {
    cmd
}