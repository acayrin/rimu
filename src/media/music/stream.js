const prism = require('prism-media');

module.exports.convert = (get, _filter) => {
  let FFargs = ['-analyzeduration', '0', '-loglevel', '0', '-vn', '-f', 's16le', '-ar', '48000', '-ac', '2', '-ab', '64', _filter ? `-af ${_filter}` : ''];
  const transcoder = new prism.FFmpeg({
    args: FFargs
  });
  const s16le = get.pipe(transcoder);
  const opus = new prism.opus.Encoder({
    rate: 48000,
    channels: 2,
    frameSize: 2880
  });
  const stream = s16le.pipe(opus);
  stream.on('close', () => {
    transcoder.destroy();
    opus.destroy();
  });
  return stream;
};