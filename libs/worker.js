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
      console.log(this.job, '<<<@job');
      this.client.hmset(this.getKey(), this.job, this.runTask.bind(this));
    }

    Worker.prototype.runTask = function() {
      var cronText;
      cronText = "*/5 " + this.job.schedule;
      return this.cron = new CronJob(cronText, this.runCommand.bind(this), null, true);
    };

    Worker.prototype.runCommand = function() {
      console.log('runCommand');
      return this.isActive((function(_this) {
        return function(err, isActive) {
          var timeout;
          console.log(isActive, 'isActive');
          if (isActive) {
            return console.log("Cron was run, status still active");
          } else {
            console.log("Running command: " + _this.job.schedule + " " + _this.job.command);
            _this.set("status", "active");
            _this.child = exec(_this.job.command, function(error, stdout, stderr) {
              var execResult;
              console.log("Run command completed: " + _this.job.schedule + " " + _this.job.command);
              execResult = {
                error: error,
                stdout: stdout,
                stderr: stderr
              };
              return _this.complete(execResult);
            });
            timeout = _this.cron._timeout._idleTimeout;
            return setTimeout(_this.killActiveJob.bind(_this), timeout - 1000);
          }
        };
      })(this));
    };

    Worker.prototype.killActiveJob = function() {
      this.child.kill("SIGINT");
      console.log('kill killActiveJob');
      return this.complete({
        stdout: "Job has terminate by bunnycron from process timeout"
      });
    };

    Worker.prototype.isActive = function(callback) {
      return this.client.hgetall(this.getKey(), (function(_this) {
        return function(err, result) {
          console.log(result, '<<<<<<<');
          return _this.client.hsetnx(_this.getKey(), "is_run", 'running', function(err, is_run) {
            console.log(err, is_run);
            if (is_run === 1) {
              return callback(null, false);
            } else {
              return callback(null, false);
            }
          });
        };
      })(this));
    };

    Worker.prototype.complete = function(data) {
      var log, next_run, status;
      log = data.stderr || data.stdout;
      log = log.replace('\n', '\\n');
      console.log(log);
      if ((data.stderr !== "") || data.error) {
        status = "failed";
      } else {
        status = "completed";
      }
      this.set("status", status);
      this.set("completed_at", Date.now());
      next_run = moment().add('milliseconds', this.cron._timeout._idleTimeout).valueOf();
      this.set("next_run", next_run);
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
      var hash;
      hash = this.prefix + ':log:' + this.job.id;
      console.log(hash, log);
      return this.client.multi().lpush(hash, log).ltrim(hash, 0, 20).exec();
    };

    Worker.prototype.getKey = function() {
      return this.prefix + ':job:' + this.job.id;
    };

    return Worker;

  })();

  module.exports = Worker;

}).call(this);
