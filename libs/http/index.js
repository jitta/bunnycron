(function() {
  var app, client, express, json, moment;

  express = require("express");

  json = require("./routes/json");

  client = require("../redis").createClient();

  moment = require('moment');

  app = express();

  module.exports = app;

  app.set("view engine", "jade");

  app.set("views", __dirname + "/views");

  app.set("title", "Bunny");

  app.use(express.favicon());

  app.use(express["static"](__dirname + "/public"));

  app.get('/stats', json.stats);

  app.get("/bunny", function(req, res) {
    res.locals.moment = moment;
    return res.render("layout");
  });

}).call(this);
