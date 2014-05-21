cron = require('cron');
fs = require('fs');
crypto = require('crypto')

module.exports = Cron = {};

Jobs = []

Cron.loadfile = function(file){
  fs.readFile(file, 'utf8', function(err, data){
    if(err){
      console.error(err);
    }else{
      lines = data.split('\n');
      for (var i = 0; i <= lines.length-1; i++) {
        line = lines[i];
        cols = line.split(' ');

        schedule = cols.slice(0,5).join(' ');
        command = cols.slice(5).join(' ');

        if(command == '') continue;
        job = {
          id: makeJobId(line),
          schedule: schedule,
          command: command
        }
        Jobs.push(job);

        // add to cron
      }
    }
  });
}

makeJobId = function(command){
  return require('crypto').createHash('md5').update(command).digest('hex');
}