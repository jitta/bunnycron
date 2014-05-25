cron = require('cron');
fs = require('fs');
crypto = require('crypto')

module.exports = Cron = {};

Jobs = []

Cron.loadFile = function(file, callback){
  data = fs.readFileSync(file, 'utf8')
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

  }

  return Jobs

}

makeJobId = function(command){
  return require('crypto').createHash('md5').update(command).digest('hex');
}