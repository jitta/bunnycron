redis = require("redis")

###
Create a RedisClient.

@return {RedisClient}
@api private
###


exports.defaultCreateClient = exports.createClient

###
Create or return the existing RedisClient.

@return {RedisClient}
@api private
###
exports.client = ->
  exports._client or (exports._client = exports.createClient())


###
Resets internal variables to initial state

@api private
###
exports.reset = ->
  exports._client = null
  exports._pubsub = null
  exports.createClient = exports.defaultCreateClient
  return

exports.setupConfig = (options) ->
  options.prefix = options.prefix or 'bunny'
  options.redis = options.redis or {}
  exports.reset()

  exports.createClient = ->
    socket = options.redis.socket
    port = unless socket then (options.redis.port || 6379) else null
    host = unless socket then (options.redis.host || '127.0.0.1') else null
    client = redis.createClient( socket || port , host, options.redis.options )
    if options.redis.auth
      client.auth options.redis.auth
    
    if options.redis.db
      client.select options.redis.db
    client.on 'error', (err) ->
      console.log 'bunnycron connect redis error ', err

    client.prefix = options.prefix
    client.getKey = (key) -> @prefix + ':' + key
    
    return client
