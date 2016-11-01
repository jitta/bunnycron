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
  healthcheck (error, status) ->
    console.log error, status
    if error
      return res.send error.message

    res.render "layout"
    res.json bunny

app.get "/healthcheck", (req, res) ->
  healthcheck (error, status) ->
    if error
      return res.send error: error.message

    diff = (Date.now() - unixTime) / 1000

    if status is 'ok'
      statusCode = 200
    else
      statusCode = 500

    return res.status(statusCode).send unixTime

healthcheck = (callback) ->
  bunny.client.get "#{bunny.options.prefix}:healthcheck", (error, unixTime) ->
    if error
      return callback error

    diff = (Date.now() - unixTime) / 1000

    if diff > 10
      callback null, 'error'
    else
      callback null, 'ok'
