(function() {
  var BunnyCron, Cron, Worker, app, async, crons, exec, exports, noop, redis, _;

  Cron = require("./cron");

  _ = require("lodash");

  exec = require("child_process").exec;

  async = require('async');

  Worker = require('./worker');

  redis = require("./redis");

  crons = {};

  noop = function() {};

  BunnyCron = function(options) {
    var app, defaults, self;
    self = this;
    options = options || {};
    this.cronList = [];
    defaults = {
      cronFile: "Cronfile",
      prefix: "bunny"
    };
    this.options = _.merge(defaults, options);
    redis.reset();
    redis.createClient = this.createRedisClient.bind(this);
    this.client = Worker.client = redis.createClient();
    Worker.prefix = this.options.prefix;
    this.jobs = Cron.loadFile(this.options.cronFile);
    this.init();
    return {
      app: app || (app = require("./http")),
      bunny: self
    };
  };

  exports = module.exports = BunnyCron;

  exports.version = require("../package.json").version;

  app = void 0;

  Object.defineProperty(exports, "app", {
    get: function() {
      return app || (app = require("./http"));
    }
  });

  BunnyCron.prototype.createRedisClient = function() {
    var client, host, port, self;
    if (this.options.redis == null) {
      this.options.redis = {};
    }
    self = this;
    port = this.options.redis.port || 6379;
    host = this.options.redis.host || "127.0.0.1";
    client = require('redis').createClient(port, host, this.options.redis.options);
    if (this.options.redis.auth) {
      client.auth(this.options.redis.auth);
    }
    client.on("error", function(err) {
      console.log(err);
    });
    return client;
  };

  BunnyCron.prototype.init = function() {
    return this.clearInactiveCron((function(_this) {
      return function() {
        return _this.setCron();
      };
    })(this));
  };

  BunnyCron.prototype.clearInactiveCron = function(callback) {
    var hash, self;
    self = this;
    hash = this.options.prefix + ":job*";
    return this.client.keys(hash, function(err, results) {
      var fns, id, result, total, _fn, _i, _len;
      if ((err != null) || results.length === 0) {
        callback();
      }
      fns = [];
      total = results.length;
      _fn = function(id) {
        return fns.push(function(done) {
          return self.del(id, "is_run", done);
        });
      };
      for (_i = 0, _len = results.length; _i < _len; _i++) {
        result = results[_i];
        id = result.split(":")[2];
        _fn(id);
      }
      return async.parallel(fns, function(err, result) {
        hash = "bunny:job:067856985fa00c05ed8681e2d63e0473";
        console.log('after clearInactiveCron');
        return self.client.hgetall(hash, function(err, result) {
          console.log(result);
          console.log('Clear active job complete');
          return callback();
        });
      });
    });
  };

  BunnyCron.prototype.setCron = function() {
    var job;
    job = this.jobs[0];
    return new Worker(job);
  };

  BunnyCron.prototype.addCron = function(job) {
    var cronText, self;
    self = this;
    return cronText = "00 " + job.schedule;
  };

  BunnyCron.prototype.del = function(id, key, callback) {
    var hash;
    hash = this.options.prefix + ":job:" + id;
    return this.client.hdel(hash, key, callback || noop);
  };

  exports.startCron = function(options) {
    if (!BunnyCron.singleton) {
      BunnyCron.singleton = new BunnyCron(options);
    }
    return BunnyCron.singleton;
  };

}).call(this);
