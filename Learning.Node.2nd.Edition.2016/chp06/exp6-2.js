// Modifying an existing fileby inserting a string
const fs = require('fs')

fs.open('./output.txt', 'r+', function(err, fd){
  if(err) return console.error(err)

  var writable = fs.createWriteStream(null, 
  {fd: fd, start: 10, defaultEncoding: 'utf8'})
  writable.write(' inserting this text')
})