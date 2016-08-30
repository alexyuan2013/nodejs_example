//导入nodejs自带的http模块
var http = require("http");

function start() {
	function onRequest(request, response){
		console.log("Request received.");
		response.writeHead(200, {"Content-Type": "text/plain"});
		response.write("Hello World");
		response.end();
	}

	http.createServer(onRequest).listen(8888);
	
	console.log("Server has started");
}

//将start方法导出为模块
exports.start = start;
