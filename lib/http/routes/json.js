(function() {
  var async, bunny, client, getJobsData, getLatestLog, isTrim, prefix, trimLog, _;

  async = require('async');

  _ = require('lodash');

  bunny = require("../../");

  client = bunny.client;

  prefix = bunny.client.prefix;

  exports.configs = function(req, res) {
    bunny.options.version = require('../../../package.json').version;
    return res.json(bunny.options);
  };

  exports.logs = function(req, res) {
    var hash;
    hash = "" + prefix + ":log:" + req.params.id;
    return client.lrange(hash, 0, -1, function(err, logs) {
      var mapLogs;
      mapLogs = logs.map(function(log) {
        return JSON.parse(log);
      });
      return res.json(mapLogs);
    });
  };

  exports.stats = function(req, res) {
    return async.parallel({
      data: getJobsData,
      logs: getLatestLog
    }, function(err, results) {
      var map;
      if (err) {
        return res.status(400).json({
          error: err.message
        });
      }
      if (results.data == null) {
        return res.json([]);
      }
      map = results.data.map(function(item) {
        var _ref;
        if (((_ref = results.logs) != null ? _ref[item.id] : void 0) != null) {
          item.log = results.logs[item.id];
        }
        return item;
      }).sort(function(a, b) {
        return a.order - b.order;
      });
      return res.json(map);
    });
  };

  getJobsData = function(done) {
    var eachFn;
    eachFn = function(key, _done) {
      return client.hgetall(key, function(err, item) {
        return _done(err, item);
      });
    };
    return client.keys("" + prefix + ":job*", function(err, keys) {
      if (err || keys.length === 0) {
        return done(err);
      }
      return async.map(keys, eachFn, function(error, results) {
        return done(error, results);
      });
    });
  };

  getLatestLog = function(done) {
    var maxLine, results;
    maxLine = 100;
    results = {};
    return client.keys("" + prefix + ":log*", function(err, keys) {
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
          return client.lrange(key, 0, 0, function(err, item) {
            var id, parsedItem;
            count++;
            id = key.split(':')[2];
            parsedItem = JSON.parse(item[0]);
            if (isTrim(parsedItem.data, maxLine)) {
              parsedItem.data = trimLog(parsedItem.data, maxLine);
              parsedItem.isTrim = true;
            } else {
              parsedItem.isTrim = false;
            }
            results[id] = parsedItem;
            if (count === total) {
              return done(null, results);
            }
          });
        })(key));
      }
      return _results;
    });
  };

  isTrim = function(log, maxLine) {
    var split;
    split = log.split('\n');
    if (split.length > 100) {
      return true;
    } else {
      return false;
    }
  };

  trimLog = function(log, maxLine) {
    if (maxLine == null) {
      maxLine = 100;
    }
    log = log.split('\n').slice(0, maxLine).join('\n');
    return log;
  };

}).call(this);
