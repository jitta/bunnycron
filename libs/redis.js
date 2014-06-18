(function() {
  var redis;

  redis = require("redis");


  /*
  Create a RedisClient.
  
  @return {RedisClient}
  @api private
   */

  exports.createClient = function() {
    var client;
    client = void 0;
    client = redis.createClient();
    return client;
  };

  exports.defaultCreateClient = exports.createClient;


  /*
  Create or return the existing RedisClient.
  
  @return {RedisClient}
  @api private
   */

  exports.client = function() {
    return exports._client || (exports._client = exports.createClient());
  };


  /*
  Return the pubsub-specific redis client.
  
  @return {RedisClient}
  @api private
   */

  exports.pubsubClient = function() {
    return exports._pubsub || (exports._pubsub = exports.createClient());
  };


  /*
  Resets internal variables to initial state
  
  @api private
   */

  exports.reset = function() {
    exports._client = null;
    exports._pubsub = null;
    exports.createClient = exports.defaultCreateClient;
  };

}).call(this);
