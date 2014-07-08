exec = require("child_process").exec
moment = require('moment')
CronJob = require("cron").CronJob
noop = ->

class Worker
  constructor: (@job) ->
    @client = Worker.client
    @prefix = Worker.prefix
    @initStatus()

  initStatus: ->
    @client.hmset @getKey(), @job, @runTask.bind(this)

  runTask: ->
    @cron = new CronJob(@job.schedule, @runCommand.bind(this), null, true)
    @set "next_run", @getNextRun()


  runCommand: ->
    @isActive (err, isActive) =>
      console.log isActive,'isActive'
      if isActive is false
        console.log "Running command: " + @job.schedule + " " + @job.command
        # @set "status", "active"
        @child = exec @job.command, (error, stdout, stderr) =>
          console.log "Run command completed: "+ @job.schedule + " " + @job.command
          status = 'timeout' if error?.killed
          execResult =
            error: error
            stdout: stdout
            stderr: stderr

          @complete execResult, status

        timeout = @cron._timeout._idleTimeout
        setTimeout @killActiveJob.bind(this), timeout - 1000


  killActiveJob: ->
    @child.kill "SIGINT"
    console.log "Job has terminate by bunnycron from process timeout"

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
    # console.log data
    log = data.stderr or data.stdout
    
    unless status
      if (data.stderr isnt "") or data.error
        status = "failed"
      else
        status = "completed"

    @set "status", status
    @set "completed_at", Date.now()
    @set "next_run", @getNextRun()
    @del "is_run"
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
