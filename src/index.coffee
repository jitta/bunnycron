Cron = require("./cron")
_ = require("lodash")
exec = require("child_process").exec
async = require('async')
Worker = require('./worker')
redis = require("./redis")
app = options = undefined

noop = ->


BunnyCron =  (@options = {})->
  self = @
  @client = exports.client
  createWorker = ->
    self.jobs = Cron.loadFile(self.options.cronFile)
    self.worker = []
    for job in self.jobs
      self.worker.push new Worker(job, self.options)

  createWorker() if @options.cronFile?

  @init()

  return @


exports = module.exports = (options = {}) ->
  if options.cronFile
    cronFile = options.cronFile.replace(/\/$/, '') + '/Cronfile'
  else
    cronFile = './Cronfile'


  options.cronFile = cronFile
  options.prefix = options.prefix or 'bunny'
  redis.setupConfig options
  exports.client = Worker.client = redis.createClient()
  Worker.prefix = options.prefix
  exports.options = options

  return exports

Object.defineProperty exports, 'app', {
  get: ->
    return (app = require("./http") )
}

exports.startCron = ->
  BunnyCron.singleton = new BunnyCron(exports.options) unless BunnyCron.singleton
  BunnyCron.singleton


exports.version = require("../package.json").version


BunnyCron::init = ->
  async.parallel [
    @clearInactiveJobs.bind(this)
    @clearRunningJobs.bind(this)
    @clearInactiveLogs.bind(this)
    ], ->

###
When you changed jobs on Cronfile. Old jobs key won't deleted.
###
BunnyCron::clearInactiveJobs = (callback) ->
  self = this
  hash = @options.prefix + ":job*"
  @client.keys hash, (err, keys) =>
    return callback() if err? or keys.length is 0
    inactiveJobs = @filterInactiveJobs keys, @jobs

    eachTaskFn = (id, done) ->
      self.client.del id, done

    parallel inactiveJobs, eachTaskFn, callback
    # parallel inactiveJobs, eachTaskFn,

BunnyCron::clearRunningJobs = (callback) ->
  self = this
  hash = @options.prefix + ":job*"
  @client.keys hash, (err, keys) ->
    return callback() if err? or keys.length is 0

    eachTaskFn = (key, done) ->
      id = key.split(":")[2]
      self.del id, "is_run", done

    parallel keys, eachTaskFn, callback

BunnyCron::clearInactiveLogs = (callback) ->
  self = this
  hash = @options.prefix + ":log*"
  @client.keys hash, (err, keys) =>
    return callback() if err? or keys.length is 0
    inactiveJobs = @filterInactiveJobs keys, @jobs

    eachTaskFn = (id, done) ->
      self.client.del id, done

    parallel inactiveJobs, eachTaskFn, callback

BunnyCron::filterInactiveJobs = (keys, jobs) ->
  return _.filter keys, (item) ->
    id = item.split(':')[2]
    return !(_.find(jobs,{id:id}))



BunnyCron::del = (id, key, callback) ->
  hash = @options.prefix + ":job:" + id
  @client.hdel hash, key, callback or noop

BunnyCron::shutdown = exports.shutdown = ->
  BunnyCron.singleton = null


exports.parallel = parallel = (tasks, fn, done) ->
    fns = []
    for task in tasks
      do (task) ->
        fns.push (cb) -> fn task, cb

    async.parallel fns, done
