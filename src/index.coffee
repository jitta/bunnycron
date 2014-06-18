Cron = require("./cron")
_ = require("lodash")
exec = require("child_process").exec
async = require('async')
Worker = require('./worker')
redis = require("./redis")
crons = {}

noop = ->


BunnyCron = (options) ->
  self = this
  options = options or {}
  @cronList = []
  defaults =
    cronFile: "Cronfile"
    prefix: "bunny"
  @options = _.merge(defaults, options)
  
  redis.reset()
  redis.createClient = @createRedisClient.bind(this)
  @client = Worker.client = redis.createClient()
  Worker.prefix = @options.prefix
  @jobs = Cron.loadFile(@options.cronFile)
  @init()
  app: app or (app = require("./http"))
  bunny: self

exports = module.exports = BunnyCron
exports.version = require("../package.json").version
app = undefined

Object.defineProperty exports, "app",
  get: ->
    app or (app = require("./http"))

BunnyCron::createRedisClient =  ->
  @options.redis = {} unless @options.redis?
  self = this
  port = @options.redis.port or 6379
  host = @options.redis.host or "127.0.0.1"
  client = require('redis').createClient(port, host, @options.redis.options)
  client.auth @options.redis.auth  if @options.redis.auth
  client.on "error", (err) ->
    console.log err
    return

  return client

BunnyCron::init = ->
  @clearInactiveCron =>
    @setCron()

BunnyCron::clearInactiveCron = (callback)->
  self = this
  hash = @options.prefix + ":job*"
  @client.keys hash, (err, results) ->
    callback() if err? or results.length is 0
    fns = []
    total = results.length

    for result in results
      id = result.split(":")[2]
      do (id) ->
        fns.push (done) ->
          self.del id, "is_run", done

    async.parallel fns, (err,result)->
      hash = "bunny:job:067856985fa00c05ed8681e2d63e0473"
      console.log 'after clearInactiveCron'
      self.client.hgetall hash, (err, result) ->
        console.log result
        console.log 'Clear active job complete'
        callback()
          

BunnyCron::setCron = ->
  job = @jobs[0]
  new Worker(job)
  # for job in @jobs
    # console.log job

BunnyCron::addCron = (job) ->
  self = this
  cronText = "00 " + job.schedule
  
  # cronText = '*/10 ' + job.schedule;
  # runCommand = ->
  #   hash = self.options.prefix + ":job:" + job.id
  #   self.client.hsetnx hash, "is_run", 1, (err, result) ->
  #     if result is 1
  #       console.log "Running command: " + job.schedule + " " + job.command
  #       self.set job.id, "status", "active"
  #       execFn = (error, stdout, stderr) ->
  #         console.log "Run command completed", job.id
  #         execResult =
  #           error: error
  #           stdout: stdout
  #           stderr: stderr

  #         self.complete job.id, execResult
  #         return

  #       childs[job.id] = exec(job.command, execFn)
  #       timeout = crons[job.id]._timeout._idleTimeout
  #       killHangJob = ->
  #         childs[job.id].kill "SIGINT"
  #         self.complete job.id,
  #           stdout: "Job has terminate by bunnycron from process timeout"

  #         return

  #       setTimeout killHangJob, timeout - 1000
  #     else
  #       console.log "Cron was run, status still active"
  #     return

  #   return

  # crons[job.id] = new CronJob(cronText, runCommand, null, true)
  # return


BunnyCron::del = (id, key, callback) ->
  hash = @options.prefix + ":job:" + id
  @client.hdel hash, key, callback or noop


exports.startCron = (options) ->
  BunnyCron.singleton = new BunnyCron(options)  unless BunnyCron.singleton
  BunnyCron.singleton