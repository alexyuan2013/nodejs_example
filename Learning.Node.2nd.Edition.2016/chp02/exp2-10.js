const fs = require('fs')
const writeStream = fs.createWriteStream('./log.txt', {
  'flag': 'a',
  'encoding': 'utf8',
  'mode': 0666
})

writeStream.on('open', function(){
  fs.readdir('./data/', function(err, files){
    if(err){
      console.error(err)
    } else {
      files.forEach(function(name){
        fs.readFile('./data/' + name, 'utf8', function(err,data){
          if(err){
            console.error(err.message)
          } else {
            let adjData = data.replace(/somecompany\.com/g, 'burningbird.net')
            fs.writeFile('./data/' + name, adjData, function(err){
              if(err){
                console.error(err.message)
              } else {
                writeStream.write('change ' + name + '\n', 'utf8', function(err){
                  if(err) console.error(err.message)
                })
              }
            })
          }
        })
      })
    }
  })
})

writeStream.on('error', function(err){
  console.error('Error: ' + err)
})