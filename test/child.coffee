sinon = require 'sinon'
bunny = require '../'
redisHelper = require './helper/redis'

describe 'startCron', ->
  after (done) -> redisHelper.flushAll done
  afterEach ->
    bunny.shutdown()

  it 'Should save environment variable when run command', (done) ->
    config = 
      cronFile: __dirname + '/cronfile/env'

    bunny = require('../')(config)
    bun = bunny.startCron()
    worker = bun.worker[0]
    worker.on 'complete', (data) ->
      expect(data).eql 'aaa\nbbb\n'
      worker.stop()
      done()

  it 'Should save both stdout and stderr to log', (done) ->

    config = 
      cronFile: __dirname + '/cronfile/stdout'

    bunny = require('../')(config)
    bun = bunny.startCron()
    worker = bun.worker[0]
    msg = 'Normal 1\nError 2\nNormal 3\nError 4\nError 5\nNormal 6\n'
    worker.on 'complete', (data) ->
      expect(data).eql msg
      bunny.client.lrange 'bunny:log:' + worker.job.id, 0, -1, (err, logs) ->
        expect(logs).have.length 1
        log = JSON.parse logs[0]
        expect(log.data).eql msg
        worker.stop()
        done()

  it 'Should set status to timeout when script not run finished', ->
