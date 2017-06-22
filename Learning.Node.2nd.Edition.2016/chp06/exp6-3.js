// Reading contents from a fileusing a stream
const fs = require('fs')

var readable = fs.createReadStream('./output.txt').setEncoding('utf8')

var data = ''
readable.on('data', function(chunk){
  data += chunk
})

readable.on('end', function(){
  console.log(data)
})



