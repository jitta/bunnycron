express = require("express")
json = require("./routes/json")
client = require("../redis").createClient()
moment = require('moment')

app = express()
# expose the app
module.exports = app


app.set "view engine", "jade"
app.set "views", __dirname + "/views"
app.set "title", "Bunny"


# middleware
app.use express.favicon()
app.use express.static(__dirname + "/public")

# JSON api
app.get '/stats', json.stats


app.get "/bunny", (req, res) ->
  res.locals.moment = moment
  res.render "layout"
