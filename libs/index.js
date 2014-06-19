(function() {
  var BunnyCron, Cron, Worker, app, async, exec, exports, noop, parallel, redis, _;

  Cron = require("./cron");

  _ = require("lodash");

  exec = require("child_process").exec;

  async = require('async');

  Worker = require('./worker');

  redis = require("./redis");

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
    Worker.prefix = exports.prefix = this.options.prefix;
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
    return async.parallel([this.clearInactiveJobs.bind(this), this.clearRunningJobs.bind(this), this.clearInactiveLogs.bind(this)], this.createWorker.bind(this));
  };


  /* 
  When you changed jobs on Cronfile. Old jobs key won't deleted.
   */

  BunnyCron.prototype.clearInactiveJobs = function(callback) {
    var hash, self;
    self = this;
    hash = this.options.prefix + ":job*";
    return this.client.keys(hash, (function(_this) {
      return function(err, keys) {
        var eachTaskFn, inactiveJobs;
        if ((err != null) || keys.length === 0) {
          return callback();
        }
        inactiveJobs = _this.filterInactiveJobs(keys, _this.jobs);
        eachTaskFn = function(id, done) {
          return self.client.del(id, done);
        };
        return parallel(inactiveJobs, eachTaskFn, callback);
      };
    })(this));
  };

  BunnyCron.prototype.clearRunningJobs = function(callback) {
    var hash, self;
    self = this;
    hash = this.options.prefix + ":job*";
    return this.client.keys(hash, function(err, keys) {
      var eachTaskFn;
      if ((err != null) || keys.length === 0) {
        return callback();
      }
      eachTaskFn = function(key, done) {
        var id;
        id = key.split(":")[2];
        return self.del(id, "is_run", done);
      };
      return parallel(keys, eachTaskFn, callback);
    });
  };

  BunnyCron.prototype.clearInactiveLogs = function(callback) {
    var hash, self;
    self = this;
    hash = this.options.prefix + ":log*";
    return this.client.keys(hash, (function(_this) {
      return function(err, keys) {
        var eachTaskFn, inactiveJobs;
        if ((err != null) || keys.length === 0) {
          return callback();
        }
        inactiveJobs = _this.filterInactiveJobs(keys, _this.jobs);
        eachTaskFn = function(id, done) {
          return self.client.del(id, done);
        };
        return parallel(inactiveJobs, eachTaskFn, callback);
      };
    })(this));
  };

  BunnyCron.prototype.filterInactiveJobs = function(keys, jobs) {
    return _.filter(keys, function(item) {
      var id;
      id = item.split(':')[2];
      return !(_.find(jobs, {
        id: id
      }));
    });
  };

  BunnyCron.prototype.createWorker = function() {
    var job, _i, _len, _ref, _results;
    console.log('createWorker');
    _ref = this.jobs;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      job = _ref[_i];
      _results.push(new Worker(job));
    }
    return _results;
  };

  BunnyCron.prototype.del = function(id, key, callback) {
    var hash;
    hash = this.options.prefix + ":job:" + id;
    return this.client.hdel(hash, key, callback || noop);
  };

  exports.parallel = parallel = function(tasks, fn, done) {
    var fns, task, _fn, _i, _len;
    fns = [];
    _fn = function(task) {
      return fns.push(function(cb) {
        return fn(task, cb);
      });
    };
    for (_i = 0, _len = tasks.length; _i < _len; _i++) {
      task = tasks[_i];
      _fn(task);
    }
    return async.parallel(fns, done);
  };

  exports.startCron = function(options) {
    if (!BunnyCron.singleton) {
      BunnyCron.singleton = new BunnyCron(options);
    }
    return BunnyCron.singleton;
  };

}).call(this);
