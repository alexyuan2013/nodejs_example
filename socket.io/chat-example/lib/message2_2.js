/**
 * message版本2-2——使用redis存储(sorted_set)
 */
function message(){
  //获取redis模块
  var redis = require('redis');
  var constants = require('./constants.js');
  //连接本地redis
  var redisClient = redis.createClient();
  var countID = Date.now(); //自增长的id

  //监听redis的error事件
  redisClient.on("error", function (err) {
      console.log("Error " + err);
  });

  /**
   * 在线用户列表
   * 示例：
   * {"user_id1": socket,
   *  "user_id2": socket
   * }
   */
  this.onlineUsers = {};

  /**
   * 初始化每个app的online user对象
   * app_id存储在redis的Sets中，初始化的过程中将所有的app_id取出，然后初始化
   * 此外，在新增一个app_id后也会做一次初始化，这样保证在使用online user对象时的操作安全
   */
  var init = function(){
    redisClient.smembers('app_id', function(err, replies){
      console.log(replies);
      replies.forEach(function(reply) {
        onlineUsers[reply] = {};
      }, this);
    });
  };
  init();

  /**
   * 发送消息到用户列表
   * users: [user_id1, user_id2]
   * content: '消息内容' 
   * */
  this.sendMessageToUsers = function(appID, users, content){
    //add message to sendingMessages
    var messageID = countID++;
    var usersState = {};
    for(var u in users){
      usersState[users[u]] = 0;
    }
    //redis消息内容，需要转化为string
    var redisObj = {
      'content': content,
      'users':usersState,
      'sentNum': 0
    };
    //写入到redis中，v0.0.2版中使用sorted set存储，有序
    redisClient.zadd('sending_messages' + appID, messageID, JSON.stringify(redisObj), redis.print);
    //向在线用户发送
    for(var u in users){
      //用户在线
      if(onlineUsers[appID] == undefined){
        onlineUsers[appID] = {}; //初始化
      }
      if(onlineUsers[appID][users[u]] != undefined){
        onlineUsers[appID][users[u]].emit('newMessage', {msgID: messageID, data: content, time: Date.now()});
        onlineUsers[appID][users[u]].emit('EOM', {});
      }
    }
  };

  /**
   * 发送消息列表到用户
   * user: user_id1
   */
  this.sendMessagesWhenUserLogin = function(appID, user){
    //用户统计发送的条数，当数量达到100条时，发送EOM事件
    var count=0;
    //v0.0.2读取全部数据
    redisClient.zrange('sending_messages' + appID, 0, -1, 'withscores', function(err, replies){
      if(err){
        console.log(err);
        return;
      }
      console.log(replies.length + ' replies');
      var id = "",
          content = {};
      replies.forEach(function(reply, i){
        //console.log(reply);
        try {
          if(i%2 == 0){
            content = JSON.parse(reply);
          } else {
            id = reply;
            if(onlineUsers[appID][user] != undefined && content.users[user] == 0){
              onlineUsers[appID][user].emit('newMessage', {msgID: parseInt(id), data: content.content, time:Date.now()});
              count=count+1;
            }
          }
          if(count>0 && (i==replies.length-1 || count%constants.EOM_NUM == 0)) {
            onlineUsers[appID][user].emit('EOM', {});
          }
          //console.log(i);
        } catch (err){
          console.log(err);
        }
      });
    });
  };

  /**
   * 收到消息回执后的处理
   * userID: user_id1
   * msgID: message_id1
   */
  this.receiptMessage = function(appID, userID, msgID){
    redisClient.ZRANGEBYSCORE('sending_messages' + appID, msgID, msgID, function(err, replies){
      if(err){
        console.log(err);
        return;
      }
      console.log(replies.length + ' replies');
      replies.forEach(function(reply, i){
        try{
          //console.log(reply);
          var jsonValue = JSON.parse(reply);
          if(jsonValue.users[userID]==0){//避免同一消息多次回执导致的计数错误
            jsonValue.sentNum = jsonValue.sentNum + 1;
          }
          jsonValue.users[userID] = 1;
          //jsonValue.sentNum = jsonValue.sentNum + 1;
          //删除原来的一条
          redisClient.ZREM('sending_messages' + appID, reply, function(err, reply){
            console.log(reply + ' removed');
          });
          //所有的人已发送，则写入sent_messages，并删除sending_messages的记录        
          if(jsonValue.sentNum == Object.keys(jsonValue.users).length){
            jsonValue.sentTime = Date.now();
            redisClient.zadd('sent_messages' + appID, msgID, JSON.stringify(jsonValue), redis.print);
          } else {
            //更新sendingMessages队列状态
            redisClient.zadd('sending_messages' + appID, msgID, JSON.stringify(jsonValue), redis.print);
          }
          //console.log(i);
        } catch (err){
          console.log(err);
        }
      });
    });
  };

  //添加app
  this.addAppID = function(appID){
    redisClient.sadd('app_id', appID, function(err, reply){
      if(err){
        console.log(err);
        return;
      }
      if(reply>0){
        onlineUsers[appID] = {}; 
      }
    });
  };

  //获取所有使用推送功能的appid
  this.getAppID = function(callback){
    var apps = [];
    redisClient.smembers('app_id', function(err, replies){
      console.log(replies);
      return callback(replies);
    });
    //return Object.keys(onlineUsers);
  };

  //获取在线用户的id
  this.getOnlineUsersID = function(appid){
    //检查appid是否已经有用户连接过，否则Object.keys会报错
    return onlineUsers[appid] ? Object.keys(onlineUsers[appid]) : null;
  };

  //获取未发消息列表
  this.getSendingMessages = function(appID, callback){
    var messages = [];
    //v0.0.2读取全部数据
    redisClient.zrange('sending_messages' + appID, 0, -1, 'withscores', function(err, replies){
      if(err){
        console.log(err);
        return;
      }
      //console.log(replies.length + ' replies');
      var msg = {},
          content = {};
      replies.forEach(function(reply, i){
        //onsole.log(reply);
        if(i%2 == 0){
          content = JSON.parse(reply);
        } else {
          msg.id = reply;
          msg.content = content;
          messages.push(msg);
          msg = {};//new message Object
        }
        //console.log(i);
      });
      callback(messages);
    });
  };

  //获取已发消息列表
  this.getSentMessages = function(appID, start, stop, callback){
    var messages = [];
    redisClient.zrevrange('sent_messages' + appID, start, stop, 'withscores', function(err, replies){
      console.log(replies.length + ' replies');
      var msg = {},
          content = {};
      replies.forEach(function(reply, i){
        //console.log(reply);
        if(i%2 == 0){
          content = JSON.parse(reply);
        } else {
          msg.id = reply;
          msg.content = content;
          messages.push(msg);
          msg = {}; //new message Object
        }
        //console.log(i);
      });
      callback(messages);
    });
  };

  return this;
}

//导出message模块
module.exports = message;