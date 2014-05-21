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

var Cron = require('./cron')

/**
 * Expose BunnyCron
 */

exports = module.exports = BunnyCron

/**
 * Library version.
 */
exports.version = require('../package.json').version

/**
 * Server Instance
 */

var app;

/**
 * Expose BunnyCron and the server.
 */

// Object.defineProperty(exports, 'app', {
//   get: function () {
//     return app || (app = require('./http'));
//   }
// });

function BunnyCron (options) {
  options = options || {}
  if(options.cronfile){
    Cron.loadfile(options.cronfile);
  }
  return {
    app: app || (app = require('./http'))
  }
}

// exports.create = function (options){
// }