
client = require('redis').createClient()

describe 'Redis - prefix', ->
  clearRedis = (prefix, cb) ->
    client.keys prefix + '*', (err, keys) ->
      remove = (item, _cb) ->
        client.del item, _cb

      async.each keys, remove, cb

  beforeEach (done) -> clearRedis 'bunny', done
  afterEach (done) -> clearRedis '', done

  it 'should use prefix bunny by default', ->
    options =
      cronFile: 'test/cronfile'

    bunny = require('../lib')(options)
    expect(bunny.client.prefix).eql 'bunny'
    bunny.shutdown()

  it 'should store job in default prefix', (done) ->
    options =
      cronFile: __dirname + '/cronfile'
    bunny = require('../lib')(options)
    bunny.startCron()
    expect(bunny.client.prefix).eql 'bunny'
    bunny.client.keys 'bunny:*', (err, keys) ->
      expect(keys).length.above 0
      bunny.shutdown()
      done()

  it 'should store job in different prefix', (done) ->
    clearRedis 'rabbit', ->
      options =
        prefix: 'rabbit'
        cronFile: 'test/cronfile'

      bunny = require('../lib')(options)
      bunny.startCron()
      expect(bunny.client.prefix).eql 'rabbit'
      bunny.client.keys 'rabbit:*', (err, keys) ->
        expect(keys).length.above 0
        bunny.shutdown()
        done()



