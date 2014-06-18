(function() {
  var async, client, cron, crons, getJobsData, getJobsLog, _;

  client = require("../../redis").createClient();

  async = require('async');

  _ = require('lodash');

  cron = require("../../cron");

  crons = cron.loadFile("examples/Cronfile");

  exports.jobs = function(req, res) {
    return res.json(crons);
  };

  exports.stats = function(req, res) {
    return async.parallel({
      data: getJobsData,
      logs: getJobsLog
    }, function(err, results) {
      var id, val, _ref, _ref1, _results;
      _results = {};
      _ref = results.data;
      for (id in _ref) {
        val = _ref[id];
        _results[id] = val;
        if (((_ref1 = results.logs) != null ? _ref1[id] : void 0) != null) {
          _results[id].logs = results.logs[id];
        }
      }
      return res.json(_results);
    });
  };

  getJobsData = function(done) {
    var results;
    results = {};
    return client.keys("bunny:job*", function(err, keys) {
      var count, key, total, _i, _len, _results;
      if (err) {
        return done(err);
      }
      total = keys.length;
      count = 0;
      _results = [];
      for (_i = 0, _len = keys.length; _i < _len; _i++) {
        key = keys[_i];
        _results.push((function(key) {
          return client.hgetall(key, function(err, item) {
            var id;
            count++;
            id = key.split(':')[2];
            results[id] = item;
            if (count === total) {
              console.log('aaaaa');
              return done(null, results);
            }
          });
        })(key));
      }
      return _results;
    });
  };

  getJobsLog = function(done) {
    var results;
    results = {};
    return client.keys("bunny:log*", function(err, keys) {
      var count, key, total, _i, _len, _results;
      if (err || keys.length === 0) {
        return done(err);
      }
      total = keys.length;
      count = 0;
      _results = [];
      for (_i = 0, _len = keys.length; _i < _len; _i++) {
        key = keys[_i];
        _results.push((function(key) {
          return client.lrange(key, 0, -1, function(err, item) {
            var id;
            count++;
            id = key.split(':')[2];
            results[id] = item;
            if (count === total) {
              return done(null, results);
            }
          });
        })(key));
      }
      return _results;
    });
  };

}).call(this);
