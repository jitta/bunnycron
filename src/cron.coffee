cron = require("cron")
fs = require("fs")
crypto = require("crypto")
CronJob = require("cron").CronJob

module.exports = Cron = {}
Cron.loadFile = (file, callback) ->
  Jobs = []
  data = fs.readFileSync(file, "utf8")
  lines = data.split("\n")
  for line, index in lines
    cols = line.split(" ")
    schedule = cols.slice(0, 6).join(" ")
    command = cols.slice(6).join(" ")
    continue  if command is ""
    if isValidCron schedule

      job =
        id: makeJobId(line)
        schedule: schedule
        command: command
        order: index + 1

      Jobs.push job
    else
      throw new Error "Cron pattern not valid: #{schedule} \n Use valid pattern 00 30 11 * * 1-5"

  return Jobs

isValidCron = (cronTime) ->
  try
    new CronJob cronTime, ->
  catch e
    return false

  return true


makeJobId = (command) ->
  require("crypto").createHash("md5").update(command).digest "hex"
