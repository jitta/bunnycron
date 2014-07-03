async = require('async')
_ = require('lodash')
bunny = require("../../")
client = bunny.client
prefix = bunny.options.prefix

exports.configs = (req, res) ->
  res.json bunny.options

exports.stats = (req, res) ->
  async.parallel
    data: getJobsData
    logs: getJobsLog
  , (err, results) ->
    _results = {}
    for id, val of results.data
      _results[id] = val
      _results[id].logs = results.logs[id] if results.logs?[id]?

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


getJobsLog = (done) ->
  results = {}
  client.keys "#{prefix}:log*", (err, keys) ->
    return done err if err or keys.length is 0
    total = keys.length
    count = 0
    for key in keys
      do (key) ->
        client.lrange key, 0, -1, (err, item) ->
          count++
          id = key.split(':')[2]
          results[id] = item
          if count is total
            done null, results


