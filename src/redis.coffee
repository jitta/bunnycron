redis = require("redis")

###
Create a RedisClient.

@return {RedisClient}
@api private
###
exports.createClient = ->
  client = undefined
  client = redis.createClient()
  client

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