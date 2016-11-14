var http = require('http');

var options1 = {
  hosts: 'localhost',
  port: '3000',
  path: '/api/message',
  method: 'POST',
  headers: {'Content-Type': 'application/json'}
}

var options2 = {
  hosts: 'localhost',
  port: '3000',
  path: '/api/broadcast',
  method: 'POST',
  headers: {'Content-Type': 'application/json'}
}

var body1 = JSON.stringify({
  "users":["00060924"], 
  "content":"test"
});

var body2 = JSON.stringify({
  'data': new Date()
});

var request1 = new http.ClientRequest(options1);
var request2 = new http.ClientRequest(options2);

var args = process.argv.slice(2);

if(args == 'broadcast'){
  request2.end(body2);
} else if(args == 'message'){
  request1.end(body1);
} else {
  request1.end(body1);
}
