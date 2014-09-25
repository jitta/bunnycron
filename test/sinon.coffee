# sinon = require 'sinon'
# throttle = (callback) ->
#   timer = undefined
#   ->
#     clearTimeout timer
#     args = [].slice.call(arguments)
#     timer = setTimeout(->
#       callback.apply this, args
#       return
#     , 100)
#     return

# clock = undefined
# before ->
#   clock = sinon.useFakeTimers()
#   return

# after ->
#   clock.restore()
#   return

# it "calls callback after 100ms", ->
#   callback = sinon.spy()
#   throttled = throttle(callback)
#   throttled()
#   clock.tick 99
#   callback.notCalled.should.ok
#   # clock.tick 1
#   # callback.calledOnce.should.ok
#   return


# Also:
# assert.equals(new Date().getTime(), 100);