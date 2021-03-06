var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http,{'pingInterval': 600000, 'pingTimeout':60000});
//var io = require('socket.io')(http);
var message = require('./lib/message2_2.js')();
var bodyParser = require('body-parser');
var constants = require('./lib/constants.js');

//配置路由
var router = express.Router();

//配置访问静态文件
app.use(express.static('public'));
//配置解析json
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html')
});

io.on('connection', function(socket){
  
  //console.log('a user connected');

  //监听登录事件，将username与websocket连接加入到列表中
  socket.on('login', function(msg){
    console.log('user: ' + msg.userID + ' login');
    message.onlineUsers[msg.userID] = socket;
    console.log('user online: ' + Object.keys(message.onlineUsers).length);
    io.sockets.emit('userLogin', {'userID': msg.userID, 'data': 'user login'});//
    //向用户发送未发消息队列
    //message.sendMessagesWhenUserLogin(msg.userID);
    socket.emit('loginSucceed',{});
  });

  //监听登出事件，删除socket连接并通知客户端
  socket.on('logout', function(msg){
    console.log('user: ' + msg.userID + ' logout');
    delete message.onlineUsers[msg.userID];
    console.log('user online: ' + Object.keys(message.onlineUsers).length);
    socket.emit('logoutSucceed',{});
  });

  //当客户端准备好后，开始发送消息
  socket.on('beginSession', function(msg){
    //向用户发送未发消息队列
    message.sendMessagesWhenUserLogin(msg.userID);
  });

  //监听chat message事件，测试用
  socket.on('chat message', function(msg){
    console.log('message:' + msg);
    var users = msg.data.split(',');
    var content = 'random number: ' + Math.floor(Math.random()*1000);
    console.log('users: ' + users);
    message.sendMessageToUsers(users, content);
  });

  socket.on('packet', function(msg, ping){
    console.log(msg + ' ' + Date.now() + ' '+ ping);
  });
  socket.on('pong', function(msg){
    console.log(msg + ' ' + Date.now());
  });

  //监听断开连接事件，删除当前socket连接
  socket.on('disconnect', function(){
    for(var s in message.onlineUsers){
      if(message.onlineUsers[s] === socket){
        console.log('user:' + s + ' disconnect');
        io.sockets.emit('user disconnect', {userID: s, data: 'user disconnect'});
        delete message.onlineUsers[s];
      }
    }
    console.log('user online: ' + Object.keys(message.onlineUsers).length);
  });
  
  //监听回执receipt事件
  socket.on('receipt', function(msg){
    //收到回执，更新sendingMessages队列等
    message.receiptMessage(msg.userID, msg.msgID);
  });


});


//定时向每个连接发送一个随机数（证明非广播）
setInterval(function(){
  //console.log("5s tick");
  for(var s in message.onlineUsers){
    var num = Math.floor(Math.random()*1000);
    message.onlineUsers[s].emit('random number', {userID: 'Server', data: num});
  }
}, 60000);
//定时向每个连接发送一个随机数（广播）
// setInterval(function(){
//   //console.log("5s tick");
//   io.sockets.emit('ALL', {'data': 'test all'});
// }, 6000);

/**
 * REST接口，返回当前在线用户的id
 */
router.get('/onlineusers', function(req, res){
  res.json(message.getOnlineUsersID());
});

/**
 * REST接口，返回未发送消息列表
 */
router.get('/sendingMessages', function(req, res){
  //定义callback函数，实际在getSendingMessages()中调用
  var msgCallback = function(data){
    res.json(data);
  };
  message.getSendingMessages(msgCallback);
});

/**
 * REST接口，返回已发送消息列表
 * 默认最多返回1000条数据
 * redis的hash中数据是按写入的顺序不定
 */
router.get('/sentMessages', function(req, res){
  //定义callback函数，实际在getSentMessages()中调用
  var msgCallback = function(data){
    res.json(data);
  };
  message.getSentMessages(0, constants.MAX_MSG_NUM-1, msgCallback);
});

/**
 * 分页返回sentMessages
 */
router.get('/sentMessages/pages/:id', function(req, res){
  try {
    var page = parseInt(req.params.id) - 1;
    var start = page*constants.PAGE_MSG_NUM;
    var stop = (page+1)*constants.PAGE_MSG_NUM-1;
    var msgCallback = function(data){
      res.json(data);
    };
    message.getSentMessages(start, stop, msgCallback);
  } catch(err){
    console.log(err);
    res.sendStatus(404);
  }
});

/**
 * REST接口，接收要发送的消息
 */
router.post('/message', function(req, res){
  var users = req.body.users;
  var content = req.body.content;
  if(users == undefined || content == undefined){
    res.send({"error":"消息格式错误"});
    return;
  }
  if(message.sendMessageToUsers){
    message.sendMessageToUsers(users, content);
    res.sendStatus(200);
  } else {
    res.send({"error": "error info"});
  }
});

/**
 * REST接口，向在线用户广播数据
 */
router.post('/broadcast', function(req, res){
  //var d = req.body.data;
  io.sockets.emit('ALL', req.body);
  res.sendStatus(200);
});



//所有接口使用api作为url的前缀
app.use('/api', router);

http.listen(3000, function(){
  console.log('listening on *: 3000');
});