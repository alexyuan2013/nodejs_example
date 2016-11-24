var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var message = require('./lib/message.js')(); //引入message模块
var bodyParser = require('body-parser');
var constants = require('./lib/constants.js');
//配置路由
var router = express.Router();

//访问静态文件
app.use(express.static('public'));
//解析json
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html')
});

/**
 * 监听用户上线
 */
io.on('connection', function(socket){
  
  //监听登录事件，将userID与socket连接加入到在线用户列表中
  socket.on('login', function(msg){
    console.log('user: ' + msg.userID + ' login');
    message.onlineUsers[msg.userID] = socket;
    console.log('user online: ' + Object.keys(message.onlineUsers).length);
    //广播登录事件，用于测试
    io.sockets.emit('userLogin', {'userID': msg.userID, 'data': 'user login'});
    //向客户端发送登录成功的回执
    socket.emit('loginSuccess', {'userID': 'Server', 'data': 'login success'});
    //向用户发送未发消息队列
    message.sendMessagesWhenUserLogin(msg.userID);
  });


  //监听断开连接事件，删除当前socket连接
  socket.on('disconnect', function(){
    for(var s in message.onlineUsers){
      if(message.onlineUsers[s] === socket){
        console.log('user:' + s + ' disconnect');
        //广播下线事件，用于测试
        io.sockets.emit('user disconnect', {userID: s, data: 'user disconnect'});
        delete message.onlineUsers[s];
      }
    }
    console.log('user online: ' + Object.keys(message.onlineUsers).length);
  });

  //监听sendMessage事件,模拟调用rest的接口
  socket.on('sendMessage', function(msg){
    //console.log('message:' + msg.data);
    var users = msg.data.split(',');
    var content = 'random number: ' + Math.floor(Math.random()*1000);
    console.log('users: ' + users);
    message.sendMessageToUsers(users, content);
    //io.sockets.emit('sendMessage', msg);
  });

  //监听回执receipt事件
  socket.on('receipt', function(msg){
    //收到回执，更新sendingMessages队列等
    message.receiptMessage(msg.userID, msg.msgID);
  });

});


//定时向每个用户发送一个随机数，测试用
setInterval(function(){
  //console.log("5s tick");
  for(var s in message.onlineUsers){
    var num = Math.floor(Math.random()*1000);
    message.onlineUsers[s].emit('random number', {userID: 'Server', data: num});
  }
}, 60000);
//定时向每个连接发送一个随机数（广播）
setInterval(function(){
  //console.log("5s tick");
  io.sockets.emit('ALL', {'data': 'test all'});
}, 6000);

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
  res.json(message.sendingMessages);
});

/**
 * REST接口，返回已发送消息列表
 * 最多返回1000条数据
 * 内存中数据的存放是按照key的添加顺序来的，因此倒叙取出最新的1000条
 */
router.get('/sentMessages', function(req, res){
  var msgs = {};
  var keys = Object.keys(message.sentMessages);
  var count = keys.length < constants.MAX_MSG_NUM ? keys.length : constants.MAX_MSG_NUM;
  for(var i=keys.length; i>keys.length-count; i--){
    msgs[keys[i-1]] = message.sentMessages[keys[i-1]];
  }
  res.json(msgs);
});

/**
 * 分页返回sentMessages
 */
router.get('/sentMessages/pages/:id', function(req, res){
  try {
    var page = parseInt(req.params.id) - 1;
    var msgs = {};
    var keys = Object.keys(message.sentMessages);
    for(var i=keys.length-page*constants.PAGE_MSG_NUM; i>0&&i>keys.length-(page+1)*constants.PAGE_MSG_NUM; i--){
      msgs[keys[i-1]] = message.sentMessages[keys[i-1]];
    }
    res.json(msgs);
  } catch(err){
    console.log(err);
    res.sendStatus(404);
  }
});

/**

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