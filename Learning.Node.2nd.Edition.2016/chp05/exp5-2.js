const http = require('http')
const querystring = require('querystring')

var postData = querystring.stringify({
  'msg': 'Hello world'
})

var options = {
  hostname: '127.0.0.1',
  port:8214,
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlcoded',
    'Content-Length': postData.length
  }
}

var req = http.request(options, function(res){
  console.log('Status: ' + res.statusCode)
  console.log('Headers: ' +  JSON.stringify(res.headers))
  res.setEncoding('utf8')
  res.on('data', function(chunk){
    console.log('Body: ' + chunk)
  })
  res.on('end', function(){
    console.log('No more data in response')
  })
})

req.on('error', function(e){
  console.error('problem with request: ' + e.message)
})

req.write(postData)
req.end()