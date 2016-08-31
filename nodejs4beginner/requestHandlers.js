var exec = require("child_process").exec;

function start(response){
	console.log("Request handler 'start' was called.");
	//休眠函数
	function sleep(milliSecond) {
		var startTime = new Date().getTime();
		while(new Date().getTime() - startTime < milliSecond);
	}

	var content = "empty";

	exec("find /", {timeout: 10000, maxBuffer: 20000*1024}, function(error, stdout, stderr){
		response.writeHead(200, {"Content-Type": "text/plain"});
		response.write(stdout);
		response.end()
		//content = stdout;
	});

	//sleep(10000); //休眠10s
	//return "Hello Start";

	//return content;
}

function upload(response){
	console.log("Request handler 'upload' was called.");
	response.writeHead(200, {"Content-Type": "text/plain"});
	response.write("Hello Upload");
	response.end();
	//return "Hello Upload";
}



exports.start = start;
exports.upload = upload;