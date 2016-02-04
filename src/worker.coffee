exec = require("child_process").exec
moment = require('moment')
CronJob = require("cron").CronJob
events = require('events')

noop = ->

class Worker
  constructor: (@job, @options) ->
    @client = Worker.client
    @prefix = Worker.prefix
    @initStatus()
    return @

  initStatus: ->
    @client.hmset @getKey(), @job, @runTask.bind(this)

  runTask: ->
    @cron = new CronJob
      cronTime: @job.schedule
      onTick: @runCommand.bind(this)
      start: true
      timeZone: "UTC"

    @set "next_run", @getNextRun()

  runCommand: ->
    self = @
    @isActive (err, isActive) ->
      if isActive is false
        self.child = exec(self.job.command, maxBuffer: 5000 * 1024)
        output = ''
        self.child.stdout.on "data", (data) ->
          output += data
        self.child.stderr.on "data", (data) ->
          output += data

        self.child.on 'exit', (code, signal) ->
          console.log "Run job completed: "+ self.job.schedule + " " + self.job.command
          self.setStatus(code)
          self.complete(output)
        timeout = self.cron._timeout._idleTimeout
        setTimeout self.killActiveJob.bind(self), timeout - 1000


  setStatus: (code) ->
    unless code?
      @status = 'timeout'
    else if code is 0
      @status = "completed"
    else
      @status = "failed"


  killActiveJob: ->
    @child.kill "SIGHUP"

  isActive: (callback) ->
    @client.hsetnx @getKey(), "is_run", 'running', (err, is_run) ->
      if err
        return callback err
      else
        if is_run is 1
          callback null, false
        else
          callback null, true

  complete: (output) ->
    self = @
    log = output
    @set "status", @status
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
      status: @status

    if @options && @options.debug
      console.log log

    hash = @prefix + ':log:' + @job.id
    @client.multi().lpush(hash, JSON.stringify(logObj)).ltrim(hash, 0, 20).exec =>
      @emit 'complete', log

  getLogs: (callback) ->
    hash = "#{@prefix}:log:#{@job.id}"
    @client.lrange hash, 0, -1, (err, logs) ->
      logs = logs.map (log) -> JSON.parse(log)
      callback err, logs

  getNextRun: ->
    return moment().utc().add(@cron._timeout._idleTimeout, 'milliseconds').valueOf()

  getKey: ->
    return @prefix + ':job:' + @job.id

  start: ->
    @cron.start()

  stop: ->
    @cron.stop()


Worker.prototype.__proto__ = events.EventEmitter.prototype

module.exports = Worker
