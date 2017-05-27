const http = require('http')
const fs = require('fs')
const url = require('url')

http.createServer(function(request, response){
  let name = url.parse(request.url, true).query.name
  if(name === undefined) name = 'world'
  if(name === 'bape'){
    let file = 'bape.jpg'
    //fs.stat()确保文件存在并返回文件的相关信息，包括大小等
    fs.stat(file, function(error, stat){
      if(error){
        console.log(error)
        response.writeHead(200, {'Content-Type': 'text/plain'})
        response.end('Sorry, Bape is not available now')
      }
      //读取文件的同步版本，通常会使用异步版本
      // let image = fs.readFileSync(file)
      // response.contentType = 'img/jpeg'
      // response.contentLength = stat.size
      // response.end(image, 'binary')
      //异步版本
      fs.readFile(file, function(error, data){
        response.contentType = 'img/jpeg'
        response.contentLength = stat.size
        response.end(data, 'binary')
      })
    })
  } else {
    response.writeHead(200, {'Content-Type': 'text/plain'})
    response.end('Hello ' + name + '\n')
  }
}).listen(8124)

console.log('Server is running at 127.0.0.1:8124')