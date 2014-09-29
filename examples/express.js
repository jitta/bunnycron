var express = require('express');
var app = express()
var bunny = require('..')({cronFile:'./examples'})
bunny.startCron();
app.use(bunny.app);
console.log('Bunny starting on port 3000');
app.listen(3000);
