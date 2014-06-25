exec = require("child_process").exec
moment = require('moment')
CronJob = require("cron").CronJob
noop = ->

class Worker
  constructor: (@job) ->
    @client = Worker.client
    @prefix = Worker.prefix
    # console.log @job,'<<<@job'
    @initStatus()

  initStatus: ->
    @client.hmset @getKey(), @job, @runTask.bind(this)

  runTask: ->
    # console.log @job.schedule
    @cron = new CronJob(@job.schedule, @runCommand.bind(this), null, true)
    @set "next_run", @getNextRun()


  runCommand: ->
    console.log 'runCommand'
    # @isActive ->
    @isActive (err, isActive) =>
      console.log isActive,'isActive'
      if isActive
        console.log "Cron was run, status still active"
      else
        console.log "Running command: " + @job.schedule + " " + @job.command
        @set "status", "active"
        @child = exec @job.command, (error, stdout, stderr) =>
          console.log "Run command completed: "+ @job.schedule + " " + @job.command
          execResult =
            error: error
            stdout: stdout
            stderr: stderr

          @complete execResult

        timeout = @cron._timeout._idleTimeout
        setTimeout @killActiveJob.bind(this), timeout - 1000


  killActiveJob: ->
    @child.kill "SIGINT"
    console.log 'kill killActiveJob'
    # @complete stdout: "Job has terminate by bunnycron from process timeout"

  isActive: (callback) ->
    @client.hgetall @getKey(), (err, result) =>
      console.log result, '<<<<<<<'
      @client.hsetnx @getKey(), "is_run", 'running', (err, is_run) ->
        console.log err, is_run

      #   return callback err if err

        if is_run is 1
          callback null, false 
        else
          # callback null, true
          callback null, false

  complete: (data) ->
    log = data.stderr or data.stdout
    
    if (data.stderr isnt "") or data.error
      status = "failed"
    else
      status = "completed"
    # console.log @job
    @set "status", status
    @set "completed_at", Date.now()
    @set "next_run", @getNextRun()
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
    @client.multi().lpush(hash, JSON.stringify(logObj)).ltrim(hash, 0, 20).exec()

  getNextRun: ->
    return moment().add('milliseconds', @cron._timeout._idleTimeout).valueOf()

  getKey: ->
    return @prefix + ':job:' + @job.id

module.exports = Worker
