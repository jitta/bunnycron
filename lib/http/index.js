(function() {
  var app, baseUrl, bunny, express, healthcheck, json, moment;

  express = require("express");

  bunny = require('../../');

  json = require("./routes/json");

  moment = require('moment');

  app = express();

  module.exports = app;

  baseUrl = bunny.options.baseUrl;

  app.set("view engine", "jade");

  app.set("views", __dirname + "/views");

  app.set("title", "Bunny");

  app.use(express["static"](__dirname + "/public"));

  app.get("/stats", json.stats);

  app.get("/config", json.configs);

  app.get('/logs/:id', json.logs);

  app.get("/", function(req, res) {
    res.locals.moment = moment;
    return healthcheck(function(error, status) {
      if (error) {
        return res.send(error.message);
      }
      res.render("layout");
      return res.json(bunny);
    });
  });

  app.get("/healthcheck", function(req, res) {
    return healthcheck(function(error, status) {
      var diff, statusCode;
      if (error) {
        return res.send({
          error: error.message
        });
      }
      diff = (Date.now() - unixTime) / 1000;
      if (status === 'ok') {
        statusCode = 200;
      } else {
        statusCode = 500;
      }
      return res.status(statusCode).send(unixTime);
    });
  });

  healthcheck = function(callback) {
    return bunny.client.get("" + bunny.options.prefix + ":healthcheck", function(error, unixTime) {
      var diff;
      if (error) {
        return callback(error);
      }
      diff = (Date.now() - unixTime) / 1000;
      if (diff > 10) {
        return callback(null, 'error');
      } else {
        return callback(null, 'ok');
      }
    });
  };

}).call(this);
