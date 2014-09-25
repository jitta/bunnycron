sinon = require 'sinon'
clock = sinon.useFakeTimers()

CronJob = require('cron').CronJob;
new CronJob '*/30 * * * * *', ->
  console.log 'AAAA'
, null, true
clock.tick 1000 * 30