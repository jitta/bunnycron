
var spawn = require('child_process').spawn,
cmd = {}
for (var i = 1; i < 3; i++) {
  (function(i){
    cmd[i] = spawn('node', ['examples/cron1'] );

    cmd[i].stdout.on('data', function (data) {
      console.log('stdout'+i+': ' + data);
    });
    cmd[i].stderr.on('data', function (data) {
      console.log('stderr1'+i+': ' + data);
    });

    cmd[i].on('close', function (code) {
      console.log('close process' + i + ': child process exited with code ' + code);
    });


  })(i)
};

