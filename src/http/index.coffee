express = require("express")
json = require("./routes/json")
client = require("../redis").createClient()
moment = require('moment')
json = require('./routes/json')

app = express()
# expose the app
module.exports = app

# config
app.set "view options",
  doctype: "html"

app.set "view engine", "jade"
app.set "views", __dirname + "/views"
app.set "title", "Bunny"

# app.locals({ inspect: util.inspect })

# middleware
app.use express.favicon()
app.use app.router
app.use express.static(__dirname + "/public")

# JSON api
app.get '/stats', json.stats

app.get '/jobs', json.jobs

app.get "/", (req, res) ->
  res.locals.moment = moment
  res.render "layout"
  # res.render "test"
