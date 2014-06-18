(function() {
  var app, client, express, json, moment;

  express = require("express");

  json = require("./routes/json");

  client = require("../redis").createClient();

  moment = require('moment');

  json = require('./routes/json');

  app = express();

  module.exports = app;

  app.set("view options", {
    doctype: "html"
  });

  app.set("view engine", "jade");

  app.set("views", __dirname + "/views");

  app.set("title", "Bunny");

  app.use(express.favicon());

  app.use(app.router);

  app.use(express["static"](__dirname + "/public"));

  app.get('/stats', json.stats);

  app.get('/jobs', json.jobs);

  app.get("/", function(req, res) {
    res.locals.moment = moment;
    return res.render("layout");
  });

}).call(this);
