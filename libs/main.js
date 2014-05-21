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
 * Expose the server.
 */

Object.defineProperty(exports, 'app', {
  get: function () {
    return app || (app = require('./http'));
  }
});

function BunnyCron (options) {
  options = options || {}
}