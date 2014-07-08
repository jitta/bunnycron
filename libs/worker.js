(function() {
  var CronJob, Worker, exec, moment, noop;

  exec = require("child_process").exec;

  moment = require('moment');

  CronJob = require("cron").CronJob;

  noop = function() {};

  Worker = (function() {
    function Worker(job) {
      this.job = job;
      this.client = Worker.client;
      this.prefix = Worker.prefix;
      this.initStatus();
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
          var timeout;
          console.log(isActive, 'isActive');
          if (isActive === false) {
            console.log("Running command: " + _this.job.schedule + " " + _this.job.command);
            _this.child = exec(_this.job.command, function(error, stdout, stderr) {
              var execResult, status;
              console.log("Run command completed: " + _this.job.schedule + " " + _this.job.command);
              if (error != null ? error.killed : void 0) {
                status = 'timeout';
              }
              execResult = {
                error: error,
                stdout: stdout,
                stderr: stderr
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
      this.child.kill("SIGINT");
      return console.log("Job has terminate by bunnycron from process timeout");
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
      var log;
      log = data.stderr || data.stdout;
      if (!status) {
        if ((data.stderr !== "") || data.error) {
          status = "failed";
        } else {
          status = "completed";
        }
      }
      this.set("status", status);
      this.set("completed_at", Date.now());
      this.set("next_run", this.getNextRun());
      this.del("is_run");
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
      return this.client.multi().lpush(hash, JSON.stringify(logObj)).ltrim(hash, 0, 20).exec();
    };

    Worker.prototype.getNextRun = function() {
      return moment().add('milliseconds', this.cron._timeout._idleTimeout).valueOf();
    };

    Worker.prototype.getKey = function() {
      return this.prefix + ':job:' + this.job.id;
    };

    return Worker;

  })();

  module.exports = Worker;

}).call(this);
