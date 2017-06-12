// final version of minimal static file server
const http = require('http')
const url = require('url')
const fs = require('fs')
const mime = require('mime')
const path = require('path')

const base = __dirname + '/public_html'

http.createServer(function(req, res){
  var pathname = path.normalize(base + req.url)
  console.log(pathname)
  fs.stat(pathname, function(err, stats){
    if(err){
      console.error(err)
      res.writeHead(404)
      res.write('Not found')
      res.end()
    } else if (stats.isFile()) {
      var type = mime.lookup(pathname)
      console.log(type)
      res.setHeader('Content-Type', type)
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
    } else {
      res.writeHead(403)
      res.write('Directory access is forbidden')
      res.end()
    }
  })
}).listen(8124)




