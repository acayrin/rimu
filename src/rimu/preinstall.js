module.exports.run = () => {
  if (!require('fs').existsSync(require('ffmpeg-static'))) {
    require('../etc/utils').log('FFmpeg not found. Installing ...');

    require('child_process').execSync('node node_modules/ffmpeg-static/install.js');
  }
};