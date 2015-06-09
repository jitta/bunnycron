express = require("express")
bunny = require('../../')
json = require("./routes/json")
moment = require('moment')
# expose the app
app = express()

module.exports = app

baseUrl = bunny.options.baseUrl

app.set "view engine", "jade"
app.set "views", __dirname + "/views"
app.set "title", "Bunny"


# middleware
app.use express.static(__dirname + "/public")
# JSON api
app.get "/stats", json.stats

app.get "/config", json.configs

app.get '/logs/:id', json.logs

app.get "/", (req, res) ->
  res.locals.moment = moment
  res.render "layout"

