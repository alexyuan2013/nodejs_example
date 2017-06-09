const inputChecker = require('./inputcheck').InputChecker

var ic = new inputChecker('Alex', 'output')

ic.on('write', function(data){
  this.writeStream.write(data, 'utf8')
})

ic.on('echo', function(data){
  console.log(this.name + ' wrote ' + data)
})

ic.on('end', function(){
  process.exit()
})

process.stdin.resume()
process.stdin.setEncoding('utf8')
process.stdin.on('data', function(input){
  ic.check(input)
})