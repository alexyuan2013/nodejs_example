/**
 * message版本2——使用redis存储
 */
function message(){
  //获取redis模块
  var redis = require('redis');
  var constants = require('./constants.js');
  //连接本地redis
  var redisClient = redis.createClient();
  var count = 0; //自增长的id

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
   * 发送消息到用户列表
   * users: [user_id1, user_id2]
   * content: '消息内容' 
   * */
  this.sendMessageToUsers = function(users, content){
    //add message to sendingMessages
    var messageID = count++;
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
    //写入到redis中
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
        onlineUsers[users[u]].emit('newMessage', {msgID: messageID, data: content, time: Date.now()});
        onlineUsers[users[u]].emit('EOM', {});
      }
    }
  };

  /**
   * 发送消息列表到用户
   * user: user_id1
   */
  this.sendMessagesWhenUserLogin = function(user){
    //用户统计发送的条数，当数量达到100条时，发送EOM事件
    var count=0;
    //redis中获取数据为异步过程，同时此处为一个嵌套的过程
    //获取sending_mesages所有的keys
    redisClient.hkeys('sending_messages', function(err, replies){
      console.log(replies.length + ' replies');
      //遍历keys，查找属于用户的message，并发送
      replies.forEach(function(reply, i){
        //获取message信息
        redisClient.hget('sending_messages', reply, function(err, value){
          if(err){
            console.log(err);
          } else {
            try{
              var jsonValue = JSON.parse(value);
              if(onlineUsers[user] != undefined && jsonValue.users[user] == 0){
                onlineUsers[user].emit('newMessage', {msgID: parseInt(reply), data: jsonValue.content, time: Date.now()});
                count=count+1;
              }
              if(count>0 && (i==replies.length-1 || count%constants.EOM_NUM == 0)) {
                  onlineUsers[user].emit('EOM', {});
              }
            } catch(err){
              console.log(err);
           }
        }
        });
      });
    });
  };

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
        try{
          var jsonValue = JSON.parse(value);
          if(jsonValue.users[userID]==0){//避免同一消息多次回执导致的计数错误
            jsonValue.sentNum = jsonValue.sentNum + 1;
          }
          jsonValue.users[userID] = 1;    
          redisClient.hdel('sending_messages', msgID, redis.print);
          //所有的人已发送，则写入sent_messages，并删除sending_messages的记录        
          if(jsonValue.sentNum == Object.keys(jsonValue.users).length){
            jsonValue.sentTime = Date.now();
            redisClient.hmset('sent_messages', msgID, JSON.stringify(jsonValue), redis.print);
          } else {
            //更新sendingMessages队列状态
            redisClient.hmset('sending_messages', msgID, JSON.stringify(jsonValue), redis.print);
          }    
        } catch (err){
          console.log(err);
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