var redis=require('redis');
var redisClient = redis.createClient();

//监听redis的error事件
redisClient.on("error", function (err) {
  console.log("Error " + err);
});

var args = process.argv.slice(2);

if(args == 'add'){
	//测试sorted set add
	redisClient.zadd('sorted_set', Date.now(), 'sorted set content1', redis.print);
	redisClient.zadd('sorted_set', Date.now(), 'sorted set content2', redis.print);
	redisClient.zadd('sorted_set', Date.now(), 'sorted set content3', redis.print);
	redisClient.zadd('sorted_set', Date.now(), 'sorted set content4', redis.print);
} else if(args == 'get'){
	//测试sorted set zrange
	redisClient.zrange('sorted_set', 0, 10, 'withscores',function(err, replies){
		console.log(replies.length + ' replies');
		replies.forEach(function(reply, i){
			console.log(reply);
			//console.log(i);
		});
	});
} else {
	console.log('无效的命令');
}

