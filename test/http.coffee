request = require 'supertest'

describe 'HTTP', ->
  describe 'Default base url', ->
    bunny = undefined
    before ->
      bunny = require('../libs')()
    it '/bunny', (done) ->
      request(bunny.app).get('/bunny').expect(200, done)

    it '/bunny/stats', (done) ->
      request(bunny.app).get('/bunny/stats').expect(200, done)

    it "/bunnyconfigs", (done) ->
      request(bunny.app).get("/bunnyconfigs").expect(200, done)

  describe 'Custom base url', ->
    baseUrl = '/bugbunny'
    bunny = undefined
    before ->
      bunny = require('../libs')( baseUrl:baseUrl )
      
    it "#{baseUrl}", (done) ->
      request(bunny.app).get("#{baseUrl}").expect(200, done)

    it "#{baseUrl}/stats", (done) ->
      request(bunny.app).get("#{baseUrl}/stats").expect(200, done)

    it "/bunnyconfigs", (done) ->
      request(bunny.app).get("/bunnyconfigs").expect(200, done)




