const Redis = require('ioredis');

const reID = require('../Rimu').reID;

const rd = new Redis(reID);

function redis() {
  return rd;
}

module.exports = {
  redis
};