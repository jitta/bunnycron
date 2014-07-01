express = require("express")
json = require("./routes/json")
client = require("../redis").createClient()
bunny = (require('../../'))
moment = require('moment')
app = express()
# expose the app
module.exports = ->
  baseUrl = bunny.options.baseUrl

  app.set "view engine", "jade"
  app.set "views", __dirname + "/views"
  app.set "title", "Bunny"


  # middleware
  app.use express.favicon()
  app.use express.static(__dirname + "/public")
  # JSON api
  app.get "#{baseUrl}stats", json.stats

  app.get "/bunnyconfigs", json.configs

  app.get "#{baseUrl.slice(0,-1)}", (req, res) ->
    res.locals.moment = moment
    res.render "layout"
