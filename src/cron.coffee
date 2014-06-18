cron = require("cron")
fs = require("fs")
crypto = require("crypto")
module.exports = Cron = {}
Cron.loadFile = (file, callback) ->
  Jobs = []
  data = fs.readFileSync(file, "utf8")
  lines = data.split("\n")
  for line in lines
    cols = line.split(" ")
    schedule = cols.slice(0, 5).join(" ")
    command = cols.slice(5).join(" ")
    continue  if command is ""
    job =
      id: makeJobId(line)
      schedule: schedule
      command: command

    Jobs.push job

  return Jobs

makeJobId = (command) ->
  require("crypto").createHash("md5").update(command).digest "hex"