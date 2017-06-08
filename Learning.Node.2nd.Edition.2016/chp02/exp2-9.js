const fs = require('fs')

fs.readFile('./apples.txt', function(err, data){
  if(err){
    console.error(err)
  } else {
    var adjData = data.replace(/[Aa]apple/g, 'orange')
    fs.writeFile('./oranges.txt', adjData, function(err){
      if(err) console.error(err.stack)
    })
  }
})