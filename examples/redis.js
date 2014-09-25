bunny = require('../')({
  cronFile:'examples/Cronfile',
  redis: {
    port: 6379,
    host: 'localhost'
    }
  });
bunny.startCron()