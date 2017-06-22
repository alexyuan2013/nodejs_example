// Getting filepermissions using stat-mode
const fs = require('fs')
const Mode = require('stat-mode')

fs.stat('./log.txt', function(err, stats){
  if(err) return console.error(err)

  var mode = new Mode(stats)
  console.log(mode.toString())
  console.log('Group execute ' + mode.group.execute)
  console.log('Others write ' + mode.others.write)
  console.log('Owner read ' + mode.owner.read)
})