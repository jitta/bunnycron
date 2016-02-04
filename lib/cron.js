(function() {
  var Cron, CronJob, cron, crypto, fs, isValidCron, makeJobId;

  cron = require("cron");

  fs = require("fs");

  crypto = require("crypto");

  CronJob = require("cron").CronJob;

  module.exports = Cron = {};

  Cron.loadFile = function(file, callback) {
    var Jobs, cols, command, data, index, job, line, lines, schedule, _i, _len;
    Jobs = [];
    data = fs.readFileSync(file, "utf8");
    lines = data.split("\n");
    for (index = _i = 0, _len = lines.length; _i < _len; index = ++_i) {
      line = lines[index];
      cols = line.split(" ");
      schedule = cols.slice(0, 6).join(" ");
      command = cols.slice(6).join(" ");
      if (command === "") {
        continue;
      }
      if (isValidCron(schedule)) {
        job = {
          id: makeJobId(line),
          schedule: schedule,
          command: command,
          order: index + 1
        };
        Jobs.push(job);
      } else {
        throw new Error("Cron pattern not valid: " + schedule + " \n Use valid pattern 00 30 11 * * 1-5");
      }
    }
    return Jobs;
  };

  isValidCron = function(cronTime) {
    var e;
    try {
      new CronJob(cronTime, function() {});
    } catch (_error) {
      e = _error;
      return false;
    }
    return true;
  };

  makeJobId = function(command) {
    return require("crypto").createHash("md5").update(command).digest("hex");
  };

}).call(this);
