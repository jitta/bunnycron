var bunny = require('../');

bunny = bunny({cronfile:'../test/Cronfile'});

bunny.app.listen(3000);
console.log('UI started on port 3000');
