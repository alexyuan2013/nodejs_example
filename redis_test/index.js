var redis=require('redis');
var redisClient = redis.createClient();

//¼àÌıredisµÄerrorÊÂ¼ş
redisClient.on("error", function (err) {
  console.log("Error " + err);
});

var args = process.argv.slice(2);

if(args == 'add'){
	//²âÊÔsorted set add
	for(var i=0; i<100; i++){
		redisClient.zadd('sorted_set', Date.now(), i + ' sorted set content', redis.print);
	}
} else if(args == 'getAll'){
	//²âÊÔsorted set zrange
	redisClient.zrange('sorted_set', 0, -1, 'withscores', function(err, replies){
		console.log(replies.length + ' replies');
		replies.forEach(function(reply, i){
			console.log(reply);
			//console.log(i);
		});
	});
} else if(args == 'get100'){
	//²âÊÔsorted set zrange
	redisClient.zrevrange('sorted_set', 0, 99, 'withscores', function(err, replies){
		console.log(replies.length + ' replies');
		replies.forEach(function(reply, i){
			console.log(reply);
			//console.log(i);
		});
	});
} else if(args == 'getByScore'){
	//²âÊÔsorted set zrange
	redisClient.ZRANGEBYSCORE('sorted_set', 1480495510862, 1480495510862, 'withscores', function(err, replies){
		console.log(replies.length + ' replies');
		replies.forEach(function(reply, i){
			console.log(reply);
			//console.log(i);
		});
	});
} else if(args == 'delByScore'){
	//²âÊÔsorted set zrange
	redisClient.ZREM('sorted_set', '1 sorted set content', function(err, reply){
		console.log(reply + ' replies');
	});
} else {
	console.log('ÎŞĞ§µÄÃüÁî');
}

