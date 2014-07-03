(function() {
  var app, bunny, express, json, moment;

  express = require("express");

  json = require("./routes/json");

  bunny = require('../../');

  moment = require('moment');

  app = express();

  module.exports = function() {
    var baseUrl;
    baseUrl = bunny.options.baseUrl;
    app.set("view engine", "jade");
    app.set("views", __dirname + "/views");
    app.set("title", "Bunny");
    app.use(express.favicon());
    app.use(express["static"](__dirname + "/public"));
    app.get("" + baseUrl + "stats", json.stats);
    app.get("/bunnyconfigs", json.configs);
    return app.get("" + (baseUrl.slice(0, -1)), function(req, res) {
      res.locals.moment = moment;
      return res.render("layout");
    });
  };

}).call(this);
