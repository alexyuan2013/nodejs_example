// a simple web server
const http = require('http')
const fs = require('fs')
const base = __dirname + '/public_html'

http.createServer(function(req, res){
  var pathname = base + req.url
  console.log(pathname)
  fs.stat(pathname, function(err, stats){
    if(err){
      console.error(err)
      res.writeHead(404)
      res.write('Not found')
      res.end()
    } else {
      res.setHeader('Content-Type', 'text/html')
      var file = fs.createReadStream(pathname)
      file.on('open', function(){
        res.statusCode = 200
        file.pipe(res)
      })
      file.on('error', function(err){
        console.log(err)
        res.writaHead(403)
        res.write('permission problem')
        res.end()
      })
    }
  })
}).listen(8124)




