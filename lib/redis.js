(function() {
  var redis;

  redis = require("redis");


  /*
  Create a RedisClient.
  
  @return {RedisClient}
  @api private
   */

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
  Resets internal variables to initial state
  
  @api private
   */

  exports.reset = function() {
    exports._client = null;
    exports._pubsub = null;
    exports.createClient = exports.defaultCreateClient;
  };

  exports.setupConfig = function(options) {
    options.prefix = options.prefix || 'bunny';
    options.redis = options.redis || {};
    exports.reset();
    return exports.createClient = function() {
      var client, host, port, socket;
      socket = options.redis.socket;
      port = !socket ? options.redis.port || 6379 : null;
      host = !socket ? options.redis.host || '127.0.0.1' : null;
      client = redis.createClient(socket || port, host, options.redis.options);
      if (options.redis.auth) {
        client.auth(options.redis.auth);
      }
      if (options.redis.db) {
        client.select(options.redis.db);
      }
      client.on('error', function(err) {
        return console.log('bunnycron connect redis error ', err);
      });
      client.prefix = options.prefix;
      client.getKey = function(key) {
        return this.prefix + ':' + key;
      };
      return client;
    };
  };

}).call(this);
