(function() {
  var CronJob, Worker, events, exec, moment, noop;

  exec = require("child_process").exec;

  moment = require('moment');

  CronJob = require("cron").CronJob;

  events = require('events');

  noop = function() {};

  Worker = (function() {
    function Worker(job) {
      this.job = job;
      this.client = Worker.client;
      this.prefix = Worker.prefix;
      this.initStatus();
      return this;
    }

    Worker.prototype.initStatus = function() {
      return this.client.hmset(this.getKey(), this.job, this.runTask.bind(this));
    };

    Worker.prototype.runTask = function() {
      this.cron = new CronJob(this.job.schedule, this.runCommand.bind(this), null, true);
      return this.set("next_run", this.getNextRun());
    };

    Worker.prototype.runCommand = function() {
      return this.isActive((function(_this) {
        return function(err, isActive) {
          var output, timeout;
          if (isActive === false) {
            _this.set("status", "active");
            _this.child = exec(_this.job.command);
            output = '';
            _this.child.stdout.on("data", function(data) {
              return output += data;
            });
            _this.child.stderr.on("data", function(data) {
              return output += data;
            });
            _this.child.on("close", function(code) {
              var execResult, status;
              console.log("Run command completed: " + _this.job.schedule + " " + _this.job.command);
              if (code === 8) {
                status = 'timeout';
              }
              execResult = {
                code: code,
                data: output
              };
              return _this.complete(execResult, status);
            });
            timeout = _this.cron._timeout._idleTimeout;
            return setTimeout(_this.killActiveJob.bind(_this), timeout - 1000);
          }
        };
      })(this));
    };

    Worker.prototype.killActiveJob = function() {
      return this.child.kill("SIGINT");
    };

    Worker.prototype.isActive = function(callback) {
      return this.client.hsetnx(this.getKey(), "is_run", 'running', function(err, is_run) {
        if (err) {
          return callback(err);
        } else {
          if (is_run === 1) {
            return callback(null, false);
          } else {
            return callback(null, true);
          }
        }
      });
    };

    Worker.prototype.complete = function(data, status) {
      var log, self;
      self = this;
      log = data.data;
      if (!status) {
        if (data.code != null) {
          status = "failed";
        } else {
          status = "completed";
        }
      }
      this.set("status", status);
      this.set("completed_at", Date.now());
      this.set("next_run", this.getNextRun());
      setTimeout((function(_this) {
        return function() {
          return self.del("is_run");
        };
      })(this), 500);
      this.log(log);
    };

    Worker.prototype.del = function(key, callback) {
      this.client.hdel(this.getKey(), key, callback || noop);
      return this;
    };

    Worker.prototype.set = function(key, val, callback) {
      this.client.hset(this.getKey(), key, val, callback || noop);
      return this;
    };

    Worker.prototype.get = function(key, callback) {
      return this.client.hget(this.getKey(), key, callback);
    };

    Worker.prototype.log = function(log, callback) {
      var hash, logObj;
      logObj = {
        completedAt: Date.now(),
        data: log
      };
      hash = this.prefix + ':log:' + this.job.id;
      return this.client.multi().lpush(hash, JSON.stringify(logObj)).ltrim(hash, 0, 20).exec((function(_this) {
        return function() {
          return _this.emit('complete', log);
        };
      })(this));
    };

    Worker.prototype.getNextRun = function() {
      return moment().add(this.cron._timeout._idleTimeout, 'milliseconds').valueOf();
    };

    Worker.prototype.getKey = function() {
      return this.prefix + ':job:' + this.job.id;
    };

    Worker.prototype.start = function() {
      return this.cron.start();
    };

    Worker.prototype.stop = function() {
      return this.cron.stop();
    };

    return Worker;

  })();

  Worker.prototype.__proto__ = events.EventEmitter.prototype;

  module.exports = Worker;

}).call(this);
