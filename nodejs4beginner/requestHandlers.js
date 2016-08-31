//var exec = require("child_process").exec;
var querystring = require("querystring");
var fs = require("fs");
var formidable = require("formidable");

function start(response, request){
	console.log("Request handler 'start' was called.");
	//休眠函数
	// function sleep(milliSecond) {
	// 	var startTime = new Date().getTime();
	// 	while(new Date().getTime() - startTime < milliSecond);
	// }

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
		'<form action="/upload" enctype="multipart/form-data" method="post">' + 
		'<input type="file" name="upload"/>' +
		'<input type="submit" value="Upload file"/>' +
		'</form>' + 
		'</body>' + 
		'</html>';
	response.writeHead(200, {"Content-Type": "text/html"});
	response.write(body);
	response.end();

}

function upload(response, request){
	console.log("Request handler 'upload' was called.");
	var form = new formidable.IncomingForm();
	console.log("about to parse");
	form.parse(request, function(error, fields, files){
		console.log("parsing done");
		fs.renameSync(files.upload.path, "/tmp/test.png");
		response.writeHead(200, {"Content-Type":"text/html"});
		response.write("received image:<br/>");
		response.write("<img src='/show' />");
		response.end();
	});


	// response.writeHead(200, {"Content-Type": "text/plain"});
	// response.write("You have send: " + querystring.parse(postData).text);
	// response.end();
	//return "Hello Upload";
}

function show(response, request){
	console.log("Request handler 'show' was called.");
	fs.readFile("/tmp/test.png", "binary", function(error, file){
		if(error){
			response.writeHead(500, {"Content-Type":"text/plain"});
			response.write(error + "\n");
			response.end();
		} else {
			response.writeHead(200, {"Content-Type":"image/png"});
			response.write(file, "binary");
			response.end();
		}
	});
}

exports.start = start;
exports.upload = upload;
exports.show = show;