var Bunny = require('../');
Bunny.startCron({
  cronFile:'examples/Cronfile',
  redis: {
    port: 6379,
    host: '127.0.0.1'
  }
});