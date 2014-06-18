/**
 * Module dependencies.
 */
var express = require('express');
var app = express()
var bunny = require('..');
// bunny.startCron({cronFile:'examples/Cronfile'});
app.use(bunny.app);

app.listen(3000);
