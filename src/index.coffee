Cron = require("./cron")
_ = require("lodash")
exec = require("child_process").exec
async = require('async')
Worker = require('./worker')
redis = require("./redis")
app = undefined

noop = ->


BunnyCron =  ->
  self = this
  @options = exports.options

  redis.reset()
  redis.createClient = @createRedisClient.bind(this)
  @client = Worker.client = redis.createClient()

  Worker.prefix = exports.prefix = @options.prefix
  @jobs = Cron.loadFile(@options.cronFile)
  @init()
  bunny: self

exports = module.exports = (options = {} ) ->
  defaults =
    cronFile: "Cronfile"
    prefix: "bunny"
    baseUrl: '/bunny'

  options = _.merge(defaults, options)
  options.baseUrl = sanitizeUrl options.baseUrl
  exports.options = options
  exports.app = require("./http")()
  return exports

exports.version = require("../package.json").version

# Object.defineProperty exports, "app",
#   get: ->
#     app or (app = require("./http"))

BunnyCron::createRedisClient =  ->
  @options.redis = {} unless @options.redis?
  self = this
  port = @options.redis.port or 6379
  host = @options.redis.host or "127.0.0.1"
  client = require('redis').createClient(port, host, @options.redis.options)
  client.auth @options.redis.auth if @options.redis.auth
  client.on "error", (err) ->
    console.log 'Bunnycron connected redis error: '+err

  return client

BunnyCron::init = ->
  async.parallel [
    @clearInactiveJobs.bind(this)
    @clearRunningJobs.bind(this)
    @clearInactiveLogs.bind(this)
    ], @createWorker.bind(this)

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


BunnyCron::createWorker = ->
  # job = @jobs[0]
  # job = @jobs[0]
  # new Worker(job)
  # console.log 'createWorker'
  for job in @jobs
    new Worker(job)

# / -> /
# /sadsad -> /saad/

sanitizeUrl = (url) ->
  if url.length > 0 and url[url.length-1] isnt '/'
    url += '/'

  return url


BunnyCron::del = (id, key, callback) ->
  hash = @options.prefix + ":job:" + id
  @client.hdel hash, key, callback or noop

exports.parallel = parallel = (tasks, fn, done) ->
    fns = []
    for task in tasks
      do (task) ->
        fns.push (cb) -> fn task, cb

    async.parallel fns, done

exports.startCron = (options) ->
  BunnyCron.singleton = new BunnyCron(options)  unless BunnyCron.singleton
  BunnyCron.singleton