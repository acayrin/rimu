const fs = require('fs');

const _reID = 'redis://redistogo:3836450ed78400a4656586f169cf2765@scat.redistogo.com:11383/';
const _scID = '8VYpK2wS7aOYHwRFi4wZE1P51Z00WaeR';
const _gnID = 'cTvBBYPzs4M-1rA97lno6mpep-l-eh2W-j5u8jdW9CtunPgX_ZSJRInZ8E46YuG9';
const _dsID = 'Nzk1NjE4MTgxNTM2MDIyNTMw.X_L_LA.Dsy0CA9Qg0LHitJWKL99CVWwXq0';
const _gitUser = 'Acayrin';
const _gitPass = 'Kimbang012!';
const _ver = require('../../package.json')['version'];

module.exports.reID = _reID;
module.exports.scID = _scID;
module.exports.gnID = _gnID;
module.exports.dsID = _dsID;
module.exports.gitUser = _gitUser;
module.exports.gitPass = _gitPass;
module.exports.ver = _ver;