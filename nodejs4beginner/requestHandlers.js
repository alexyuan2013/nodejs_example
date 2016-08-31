var exec = require("child_process").exec;
var querystring = require("querystring");

function start(response, postData){
	console.log("Request handler 'start' was called.");
	//休眠函数
	function sleep(milliSecond) {
		var startTime = new Date().getTime();
		while(new Date().getTime() - startTime < milliSecond);
	}

	//var content = "empty";

	//exec("find /", {timeout: 10000, maxBuffer: 20000*1024}, function(error, stdout, stderr){
	//	response.writeHead(200, {"Content-Type": "text/plain"});
	//	response.write(stdout);
	//	response.end()
		//content = stdout;
	//});

	//sleep(10000); //休眠10s
	//return "Hello Start";

	//return content;

	var body = '<html>' +
		'<head>' + 
		'<meta http-equiv="Content-Type" content="text/html" charset="utf-8"/>' +
		'</head>' + 
		'<body>' + 
		'<form action="/upload" method="post">' + 
		'<textarea name="text" rows="20" cols="60"></textarea>' +
		'<input type="submit" value="Submit text"/>' +
		'</form>' + 
		'</body>' + 
		'</html>';
	response.writeHead(200, {"Content-Type": "text/html"});
	response.write(body);
	response.end();

}

function upload(response, postData){
	console.log("Request handler 'upload' was called.");
	response.writeHead(200, {"Content-Type": "text/plain"});
	response.write("You have send: " + querystring.parse(postData).text);
	response.end();
	//return "Hello Upload";
}



exports.start = start;
exports.upload = upload;