//导入nodejs自带的http模块
var http = require("http");
var url = require("url");

function start(route, handle) {
	function onRequest(request, response){
		
		var pathname = url.parse(request.url).pathname;
		console.log("Request for " + pathname + " received.");
		//console.log("Request received.");
		
		//将response对象最为参数传递到route函数中，负责实际的返回操作
		var content = route(handle, pathname, response);
		
		//response.writeHead(200, {"Content-Type": "text/plain"});
		//response.write(content);
		//response.end();
	}

	http.createServer(onRequest).listen(8888);
	
	console.log("Server has started");
}

//将start方法导出为模块
exports.start = start;
