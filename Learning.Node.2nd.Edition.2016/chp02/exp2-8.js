const fs = require('fs')

try{
  var data = fs.readFileSync('./apples.txt', 'utf8')
  console.log(data)
  var adjData = data.replace(/[Aa]apple/g, 'orange')
  
  fs.writeFileSync('./oranges.txt', adjData)
} catch (err) {
  console.error(err)
}