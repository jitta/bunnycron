(function() {
  var Cron, cron, crypto, fs, makeJobId;

  cron = require("cron");

  fs = require("fs");

  crypto = require("crypto");

  module.exports = Cron = {};

  Cron.loadFile = function(file, callback) {
    var Jobs, cols, command, data, job, line, lines, schedule, _i, _len;
    Jobs = [];
    data = fs.readFileSync(file, "utf8");
    lines = data.split("\n");
    for (_i = 0, _len = lines.length; _i < _len; _i++) {
      line = lines[_i];
      cols = line.split(" ");
      schedule = cols.slice(0, 5).join(" ");
      command = cols.slice(5).join(" ");
      if (command === "") {
        continue;
      }
      job = {
        id: makeJobId(line),
        schedule: schedule,
        command: command
      };
      Jobs.push(job);
    }
    return Jobs;
  };

  makeJobId = function(command) {
    return require("crypto").createHash("md5").update(command).digest("hex");
  };

}).call(this);
