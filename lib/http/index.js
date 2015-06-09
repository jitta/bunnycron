(function() {
  var app, baseUrl, bunny, express, json, moment;

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
    return res.render("layout");
  });

}).call(this);
