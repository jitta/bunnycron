/*
*
* Bunny Cron
* Copyright (c) 2014 Jitta
* MIT Licensed
*
*/

/**
 * All dependencies
 */

var Cron = require('./cron');
var _ = require('lodash');
var CronJob = require('cron').CronJob;
var exec = require('child_process').exec;
var childs = {};
var crons = {};
redis = require("redis")
noop = function() {};

/**
 * Expose BunnyCron
 */

exports = module.exports = BunnyCron;
/**
 * Library version.
 */
exports.version = require('../package.json').version;

/**
 * Server Instance
 */

var app;

/**
 * Expose BunnyCron and the server.
 */

Object.defineProperty(exports, 'app', {
  get: function () {
    return app || (app = require('./http'));
  }
});

function BunnyCron (options) {
  var self = this
  var options = options || {}
  this.cronList = []
  var defaults =  {
    cronFile: 'Cronfile',
    redisPrefix: 'bunny'
  }

  if( options.redis ){
    redis.createClient = function() {
      var self = this;
      var port = options.redis.port || 6379;
      var host = options.redis.host || '127.0.0.1';
      var client = require('redis').createClient( port , host, options.redis.options );
      if (options.redis.auth) {
          client.auth(options.redis.auth);
      }
      client.on('error', function (err) {
          self.emit('error', err);
      });
      return client;
    }
  }

  this.client = redis.createClient();
  this.options = _.merge(defaults, options);
  // console.log(this.options.cronFile)
  this.jobs = Cron.loadFile(this.options.cronFile);
  this.init()

  return {
    app: app || (app = require('./http')),
    bunny: self
  }
}

BunnyCron.prototype.init = function(){
  this.clearInactiveCron();
  this.setCron();
}

BunnyCron.prototype.clearInactiveCron = function(){
  self = this;
  hash = this.options.redisPrefix + ':job*'
  this.client.keys(hash, function(err, results){
    for (var i = 0; i < results.length; i++) {
      result = results[i]
      id = result.split(':')[2]
      self.del(id, 'is_run');
      
    };
  });
}

BunnyCron.prototype.setCron = function(){
  for (var i = this.jobs.length - 1; i >= 0; i--) {
    job = this.jobs[i];
    this.addCron(job);
  };

}

BunnyCron.prototype.addCron = function(job) {
  self = this
  cronText = '00 ' + job.schedule;
  // cronText = '*/20 ' + job.schedule;

  runCommand = function(){
    hash = self.options.redisPrefix + ':job:' + job.id;
    self.client.hsetnx(hash, 'is_run', 1, function(err,result){
      if(result == 1){
        console.log('Running command: ' + job.schedule + ' ' + job.command)
        self.set(job.id, 'status', 'active');
        execFn = function (error, stdout, stderr) {
          console.log('Run command completed',job.id)
          execResult = {
            error: error,
            stdout: stdout,
            stderr: stderr
          }
          self.complete(job.id, execResult)
        }
        childs[job.id] = exec(job.command, execFn);
        timeout = crons[job.id]._timeout._idleTimeout;
        killHangJob = function(){
          childs[job.id].kill('SIGINT');
          self.complete(job.id, {stdout:'not run complete'});
        }
        setTimeout(killHangJob, timeout-1000);
      }
    });
  }
  crons[job.id] = new CronJob(cronText, runCommand, null ,true);
};

BunnyCron.prototype.complete = function(id, data) {
  log = data.stderr || data.stdout
  console.log(data);
  key = this.options.redisPrefix + ':jobs:' + id
  // console.log(if(data.err))
  if( (data.stderr != '') || data.error){
    status = 'failed'
  }else{
    status = 'completed'
  }
  
  this.set(id, 'status', status);
  this.set(id, 'completed_at', Date.now());
  this.set(id, 'log', log);
  this.del(id, 'is_run');

}

BunnyCron.prototype.del = function(id, key, callback){
  hash = this.options.redisPrefix + ':job:' + id
  this.client.hdel(hash, key, callback || noop);
  return this;
};

BunnyCron.prototype.set = function(id, key, val, callback){
  hash = this.options.redisPrefix + ':job:' + id
  this.client.hset(hash, key, val, callback || noop);
  return this;
};

exports.startCron = function ( options ) {
  if(!BunnyCron.singleton){
    BunnyCron.singleton = new BunnyCron( options )
  }
  return BunnyCron.singleton
};