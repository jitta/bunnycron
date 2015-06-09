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
    _results = {}
    for id, val of results.data
      _results[id] = val
      _results[id].log = results.logs[id] if results.logs?[id]?

    res.json _results

getJobsData = (done)->
  results = {}
  client.keys "#{prefix}:job*", (err, keys) ->
    return done err if err or keys.length is 0
    total = keys.length
    count = 0
    for key in keys
      do (key) ->
        client.hgetall key, (err, item) ->
          count++
          id = key.split(':')[2]
          results[id] = item
          if count is total
            done null, results


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
