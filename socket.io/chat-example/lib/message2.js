/**
 * message版本2——使用redis存储
 */
function message(){
  //获取redis模块
  var redis = require('redis');
  //连接本地redis
  var redisClient = redis.createClient();


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
   * 发送消息到用户列表
   * users: [user_id1, user_id2]
   * content: '消息内容' 
   * */
  this.sendMessageToUsers = function(users, content){
    //add message to sendingMessages
    var messageID = Date.now();
    var usersState = {};
    for(var u in users){
      usersState[users[u]] = 0;
    }
    //redis
    var redisObj = {
      'content': content,
      'users':usersState,
      'sentNum': 0
    };
    redisClient.hmset('sending_messages', messageID + '', JSON.stringify(redisObj), redis.print);
    //测试用，看是否成功写入redis
    // setTimeout(function(){
    //   redisClient.hget('sending_messages', messageID, function(err, value){
    //     if(err){
    //       console.log(err);
    //     }
    //     console.log(value);
    //   });
    // });

    //向在线用户发送
    for(var u in users){
      //用户在线
      if(onlineUsers[users[u]] != undefined){
        onlineUsers[users[u]].emit('newMessage', {msgID: messageID, data: content});
        onlineUsers[users[u]].emit('EOM', {});
      }
    }
  };

  /**
   * 发送消息列表到用户
   * user: user_id1
   */
  this.sendMessagesWhenUserLogin = function(user){
    var count=0;
    redisClient.hkeys('sending_messages', function(err, replies){
      console.log(replies.length + ' replies');
      replies.forEach(function(reply, i){
        redisClient.hget('sending_messages', reply, function(err, value){
          if(err){
            console.log(err);
          } else {
            console.log(value);
            var jsonValue = JSON.parse(value);
            if(onlineUsers[user] != undefined && jsonValue.users[user] == 0){
              onlineUsers[user].emit('newMessage', {msgID: parseInt(reply), data: jsonValue.content});
              count=count+1;
              if((i==replies.length-1 && count>0) || count%100 == 0) {
                onlineUsers[user].emit('EOM', {});
              }
            }
          }
        });
      });
    });
  }

  /**
   * 收到消息回执后的处理
   * userID: user_id1
   * msgID: message_id1
   */
  this.receiptMessage = function(userID, msgID){
    redisClient.hget('sending_messages', msgID, function(err, value){
      if(err){
        console.log(err);
      } else {
        var jsonValue = JSON.parse(value);
        jsonValue.users[userID] = 1;
        jsonValue.sentNum = jsonValue.sentNum + 1;
        redisClient.hdel('sending_messages', msgID, redis.print);
        //所有的人已发送，则写入sent_messages，并删除sending_messages的记录        
        if(jsonValue.sentNum == Object.keys(jsonValue.users).length){
          jsonValue.sentTime = Date.now();
          redisClient.hmset('sent_messages', msgID, JSON.stringify(jsonValue), redis.print);
        } else {
          //更新sendingMessages队列状态
          redisClient.hmset('sending_messages', msgID, JSON.stringify(jsonValue), redis.print);
        }
        
      }      
    });
  };

  //获取在线用户的id
  this.getOnlineUsersID = function(){
    return Object.keys(onlineUsers);
  };

  //获取未发消息列表
  this.getSendingMessages = function(callback){
    redisClient.hgetall('sending_messages', function(err, value){
      var messages = {};
      if(err){
        console.log(err);
      } else {
        //console.log(value);
        for(var msg in value){
          messages[msg] = JSON.parse(value[msg]);
        }
        callback(messages);
      }
    });
  };

  //获取已发消息列表
  this.getSentMessages = function(callback){
    redisClient.hgetall('sent_messages', function(err, value){
      var messages = {};
      if(err){
        console.log(err);
      } else {
        //console.log(value);
        for(var msg in value){
          messages[msg] = JSON.parse(value[msg]);
        }
        callback(messages);
      }
    });
  };



  return this;
}

//导出message模块
module.exports = message;