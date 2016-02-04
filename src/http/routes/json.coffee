async = require('async')
_ = require('lodash')
bunny = require("../../")
client = bunny.client
prefix = bunny.client.prefix

exports.configs = (req, res) ->
  bunny.options.version = require('../../../package.json').version
  res.json bunny.options

exports.logs = (req, res) ->
  hash = "#{prefix}:log:#{req.params.id}"
  client.lrange hash, 0, -1, (err, logs) ->
    mapLogs = logs.map (log) ->
      return JSON.parse(log)
    res.json mapLogs

exports.stats = (req, res) ->
  async.parallel
    data: getJobsData
    logs: getLatestLog
  , (err, results) ->
    if err
      return res.status(400).json error: err.message

    unless results.data?
      return res.json []
      
    map = results.data.map((item) ->
        if results.logs?[item.id]?
          item.log = results.logs[item.id]

        return item
      ).sort (a, b) -> a.order - b.order

    res.json map

getJobsData = (done)->
  eachFn = (key, _done) ->
    client.hgetall key, (err, item) ->
      _done(err, item)

  client.keys "#{prefix}:job*", (err, keys) ->
    return done err if err or keys.length is 0
    async.map keys, eachFn, (error, results) ->
      done(error, results)

getLatestLog = (done) ->
  maxLine = 100
  results = {}
  client.keys "#{prefix}:log*", (err, keys) ->
    return done err if err or keys.length is 0
    total = keys.length
    count = 0
    for key in keys
      do (key) ->
        client.lrange key, 0, 0, (err, item) ->
          count++
          id = key.split(':')[2]
          parsedItem = JSON.parse item[0]

          if isTrim parsedItem.data, maxLine
            parsedItem.data = trimLog parsedItem.data, maxLine
            parsedItem.isTrim = true
          else
            parsedItem.isTrim = false

          results[id] = parsedItem

          if count is total
            done null, results

isTrim = (log, maxLine) ->
  split = log.split('\n')
  if split.length > 100
    return true
  else
    return false


trimLog = (log, maxLine = 100) ->
  log = log.split('\n').slice(0, maxLine).join('\n')
  return log
