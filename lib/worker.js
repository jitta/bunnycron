(function() {
  var CronJob, Worker, events, exec, moment, noop;

  exec = require("child_process").exec;

  moment = require('moment');

  CronJob = require("cron").CronJob;

  events = require('events');

  noop = function() {};

  Worker = (function() {
    function Worker(job, options) {
      this.job = job;
      this.options = options;
      this.client = Worker.client;
      this.prefix = Worker.prefix;
      this.initStatus();
      return this;
    }

    Worker.prototype.initStatus = function() {
      return this.client.hmset(this.getKey(), this.job, this.runTask.bind(this));
    };

    Worker.prototype.runTask = function() {
      this.cron = new CronJob({
        cronTime: this.job.schedule,
        onTick: this.runCommand.bind(this),
        start: true,
        timeZone: "UTC"
      });
      return this.set("next_run", this.getNextRun());
    };

    Worker.prototype.runCommand = function() {
      var self;
      self = this;
      return this.isActive(function(err, isActive) {
        var output, timeout;
        if (isActive === false) {
          self.child = exec(self.job.command, {
            maxBuffer: 5000 * 1024
          });
          output = '';
          self.child.stdout.on("data", function(data) {
            return output += data;
          });
          self.child.stderr.on("data", function(data) {
            return output += data;
          });
          self.child.on('exit', function(code, signal) {
            console.log("Run job completed: " + self.job.schedule + " " + self.job.command);
            self.setStatus(code);
            return self.complete(output);
          });
          timeout = self.cron._timeout._idleTimeout;
          return setTimeout(self.killActiveJob.bind(self), timeout - 1000);
        }
      });
    };

    Worker.prototype.setStatus = function(code) {
      if (code == null) {
        return this.status = 'timeout';
      } else if (code === 0) {
        return this.status = "completed";
      } else {
        return this.status = "failed";
      }
    };

    Worker.prototype.killActiveJob = function() {
      return this.child.kill("SIGHUP");
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

    Worker.prototype.complete = function(output) {
      var log, self;
      self = this;
      log = output;
      this.set("status", this.status);
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
        data: log,
        status: this.status
      };
      if (this.options && this.options.debug) {
        console.log(log);
      }
      hash = this.prefix + ':log:' + this.job.id;
      return this.client.multi().lpush(hash, JSON.stringify(logObj)).ltrim(hash, 0, 20).exec((function(_this) {
        return function() {
          return _this.emit('complete', log);
        };
      })(this));
    };

    Worker.prototype.getLogs = function(callback) {
      var hash;
      hash = "" + this.prefix + ":log:" + this.job.id;
      return this.client.lrange(hash, 0, -1, function(err, logs) {
        logs = logs.map(function(log) {
          return JSON.parse(log);
        });
        return callback(err, logs);
      });
    };

    Worker.prototype.getNextRun = function() {
      return moment().utc().add(this.cron._timeout._idleTimeout, 'milliseconds').valueOf();
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
