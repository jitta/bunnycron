var bunny = require('../')({cronFile:'examples/'})
bunny.startCron();
bunny.app.listen(3000)
console.log("Running on localhost:3000")