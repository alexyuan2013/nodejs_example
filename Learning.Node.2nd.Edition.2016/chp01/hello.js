const http = require('http')

const server = http.createServer(function(request, response){
  response.writeHead(200, {'Content-Type': 'text/plain'})
  response.end('hello world\n')
})

server.listen(8124)

console.log('Server is running at 127.0.0.1:8124')