redis = require("redis").createClient()

module.exports =
  flushAll: (done) ->
    redis.keys 'bunny:*', (err, keys) ->
      done() if keys.length is 0
      count = 0
      for key in keys
        redis.del key, ->
          count++
          if count is keys.length
            done()

