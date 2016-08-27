var WebSocketServer = require('ws').Server;
var PORT = 9087
var wss = new WebSocketServer({port: PORT});
var messages = []; //消息数组
var CLIENTS=[]; //客户端数组

wss.on('connection', function(ws){

	//有新连接过来，将当前存储的消息全部发送过去
	messages.forEach(function(message){
    ws.send(message);
  });

	ws.on('message', function (message) {
		messages.push(message); //存储客户端的消息
		CLIENTS.push(ws);
		console.log('Message Received: %s', message);
		//以下是两种发送到所有客户端的方式
		// wss.clients.forEach(function (conn) {
		//    conn.send(message);  //向所有客户端广播消息
		// });
		sendAll(message);

		sendClient(message); //发送到客户端0
	});

	

	//链接关闭
	ws.on('close', function() {
		for (var i=0; i<CLIENTS.length; i++) {
        if(CLIENTS[i] === ws){
					CLIENTS.splice(i, 1);
					console.log('disconnected');
				}
    }
		console.log("Clients online: " + CLIENTS.length);
	});

	
});



function sendAll (message) {
    for (var i=0; i<CLIENTS.length; i++) {
        CLIENTS[i].send(message);
    }
}

function sendClient (message) {
    if(CLIENTS && CLIENTS.length>0){
			CLIENTS[0].send(message);
		}
}


