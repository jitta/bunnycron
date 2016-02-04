request = require 'supertest'
express = require 'express'

describe 'HTTP', ->
  describe 'Default base url', ->
    bunny = undefined
    before ->
      bunny = require('../lib')

    it '/', (done) ->
      request(bunny.app).get('/').expect(200, done)

    it '/stats', (done) ->
      request(bunny.app).get('/stats').expect(200, done)

    it "/config", (done) ->
      request(bunny.app).get("/config").expect(200, done)

  describe 'Custom base url', ->
    baseUrl = '/bunny'
    bunny = undefined
    before (done) ->
      bunny = require('../lib')
      @app = express()
      @app.use('/bunny/', bunny.app)
      done()

    it "/bunny", (done) ->
      request(@app).get("/bunny/").expect(200, done)

    it "/bunny/stats", (done) ->
      request(@app).get("/bunny/stats").expect(200, done)

    it "/bunny/config", (done) ->
      request(@app).get("/bunny/config").expect(200, done)
