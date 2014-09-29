exec = require("child_process").exec
moment = require('moment')
CronJob = require("cron").CronJob
events = require('events')

noop = ->

class Worker
  constructor: (@job) ->
    @client = Worker.client
    @prefix = Worker.prefix
    @initStatus()
    return @

  initStatus: ->
    @client.hmset @getKey(), @job, @runTask.bind(this)

  runTask: ->
    @cron = new CronJob(@job.schedule, @runCommand.bind(this), null, true)
    @set "next_run", @getNextRun()

  runCommand: ->
    @isActive (err, isActive) =>
      if isActive is false
        @set "status", "active"
        @child = exec(@job.command)
        output = ''
        @child.stdout.on "data", (data) ->
          output += data
        @child.stderr.on "data", (data) ->
          output += data

        @child.on "close", (code) =>
          console.log "Run command completed: "+ @job.schedule + " " + @job.command
          status = 'timeout' if code is 8 # Code for SIGINT Signal
          execResult =
            code: code
            data: output

          @complete execResult, status

        timeout = @cron._timeout._idleTimeout
        setTimeout @killActiveJob.bind(this), timeout - 1000


  killActiveJob: ->
    @child.kill "SIGINT"
    # console.log "Job has terminate by bunnycron from process timeout"

  isActive: (callback) ->
    @client.hsetnx @getKey(), "is_run", 'running', (err, is_run) ->
      if err
        return callback err 
      else
        if is_run is 1
          callback null, false 
        else
          callback null, true

  complete: (data, status) ->
    self = @
    log = data.data
    
    unless status
      if data.code?
        status = "failed"
      else
        status = "completed"

    @set "status", status
    @set "completed_at", Date.now()
    @set "next_run", @getNextRun()
    setTimeout =>
      self.del "is_run"
    , 500 

    @log log
    return

  del: (key, callback) ->
    @client.hdel @getKey(), key, callback or noop
    this

  set: (key, val, callback) ->
    @client.hset @getKey(), key, val, callback or noop
    this

  get: (key, callback) ->
    @client.hget @getKey(), key, callback

  log: (log, callback) ->
    logObj =
      completedAt: Date.now()
      data: log

    hash = @prefix + ':log:' + @job.id
    @client.multi().lpush(hash, JSON.stringify(logObj)).ltrim(hash, 0, 20).exec =>
      @emit 'complete', log

  getNextRun: ->
    return moment().add(@cron._timeout._idleTimeout, 'milliseconds').valueOf()

  getKey: ->
    return @prefix + ':job:' + @job.id

  start: ->
    @cron.start()

  stop: ->
    @cron.stop()


Worker.prototype.__proto__ = events.EventEmitter.prototype

module.exports = Worker
