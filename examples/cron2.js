var Bunny = require('../');
bunny = new Bunny({cronFile:'examples/cronfiles/date'});
bunny.startCron()
console.log('cron2.js running')
