Bunny = require('../')
should = require('should');
spawn = require("child_process").spawn
sinon = require 'sinon'

redisHelper = require './helper/redis'

describe 'Initialize', ->

  afterEach (done) -> redisHelper.flushAll done

  it 'Should throw error when not found Cronfile', ->
    ( -> Bunny.startCron()).should.throw();

  it 'Should run once time per cron when run node multiple instance', (done) ->

    datas = 
      child0: []
      child1: []

    isTick = [false,false]
    # Start second child after 3 seconds
    cmd = {}
    for i in [0..1]
      do (i) ->
        j = (i * 3) * 1000
        setTimeout ->
          # console.log i
          cmd[i] = spawn("node", ["test/fixture/run"])
          cmd[i].stdout.on "data", (data) =>
            datas["child#{i}"].push data.toString()
        , 1000 + j



    checkStdout = ->
      console.log '=== Check output ==='
      # console.log datas
      if 'run from child.js\n\n' in datas.child0
        datas.child1.join().should.containEql('Cron was run')
      else
        datas.child1.join().should.containEql('run from child.js')
      cmd[0].kill('SIGHUP')
      cmd[1].kill('SIGHUP')
      done()

    setTimeout checkStdout, 1000 * 65

    




