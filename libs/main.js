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
redis = require("redis")

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
  var that = this
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
    bunny: that
  }
}

BunnyCron.prototype.init = function(){
  this.setCron()
}

BunnyCron.prototype.setCron = function(){
  for (var i = this.jobs.length - 1; i >= 0; i--) {
    job = this.jobs[i];
    this.addCron(job);
  };

}
BunnyCron.prototype.addCron = function(job) {
  that = this
  // cronText = '*/2 ' + job.schedule;
  cronText = '00 ' + job.schedule;
  runCommand = function(){
    //Is this cron was run
    // console.log(job.id,'<<<<<<<')
    key = that.options.redisPrefix + ':jobs:' + job.id + ':run'
    now = (new Date()).getTime();
    // console.log(key)
    that.client.setnx(key, now, function(err,result){
      // console.log(job.command)
      if(result == 1){
        execFn = function (error, stdout, stderr) {
          console.log('run command success',job.id)
          execResult = {
            error: error,
            stdout: stdout,
            stderr: stderr
          }
          that.complete(job.id, execResult)
        }
        exec(job.command, execFn);
      }else{
        console.log('')
      }
    });
  }
  new CronJob(cronText, runCommand, null ,true);

};
BunnyCron.prototype.isRun = function(id) {

};

BunnyCron.prototype.finishExec = function (error, stdout, stderr) {

}

BunnyCron.prototype.complete = function(id, data) {
  log = data.stderr || data.stdout
  console.log(log)
  key = this.options.redisPrefix + ':jobs:' + id
  this.client.del(key + ':run');
  this.client.set(key + ':data',log);
}


exports.createCron = function ( options ) {
  BunnyCron.singleton = new BunnyCron( options )
};