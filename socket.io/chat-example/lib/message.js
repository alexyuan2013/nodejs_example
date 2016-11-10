function message(){
    /**
   * 在线用户列表
   * 示例：
   * {"user_id1": socket,
   *  "user_id2": socket
   * }
   */
  this.onlineUsers = {};

  /**
   * 消息发送列表
   * 示例：
   * {"message_id1": { 
   *    "content": "消息内容",
   *    "users": {"user_id1": 0, "user_id2": 0},
   *    "sentNum":0 //已收到回执的个数
   *  },
   *  "message_id2":
   * }
   */
  this.sendingMessages = {};

  /**
   * 已发消息列表
   * 示例：
   * {"message_id1": { 
   *    "content": "消息内容",
   *    "users":{"user_id1": 0, "user_id2": 0},
   *    "sentTime":"timestamp"
   *  },
   *  "message_id2":
   * }
   */
  this.sentMessages = {};

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
    sendingMessages[messageID] = {
      'content': content,
      'users':usersState,
      'sentNum': 0
    };

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
   * 获取用户未发送的消息列表
   * user: user_id1 
   * */
  var getUserMessages = function(user){
    var messages = [];
    for(var mID in sendingMessages){
      if(sendingMessages[mID].users[user] == 0){
        var message = {'messageID':mID, 'content':sendingMessages[mID].content};
        messages.push(message);
      }
    }
    return messages;
  };


  /**
   * 发送消息列表到用户
   * user: user_id1
   */
  this.sendMessagesWhenUserLogin = function(user){
    var messages = getUserMessages(user);
    for(var i=0; i<messages.length; i++){
      var message = messages[i];
      if(onlineUsers[user] != undefined){
        onlineUsers[user].emit('newMessage', {msgID: message.messageID, data: message.content})
      }
      //连续发送100条数据后emit一个EOM事件
      if( (i+1)%100 == 0){
        onlineUsers[user].emit('EOM', {});
      }
    }
    if(i>0 && (i%100)!=0){
      onlineUsers[user].emit('EOM', {});
    }
  }

  /**
   * 收到消息回执后的处理
   * userID: user_id1
   * msgID: message_id1
   */
  this.receiptMessage = function(userID, msgID){
    //更新sendingMessages队列状态
    if(sendingMessages[msgID] != undefined && sendingMessages[msgID].users[userID] != undefined){
      sendingMessages[msgID].users[userID] = 1;
      sendingMessages[msgID].sentNum = sendingMessages[msgID].sentNum + 1;
      //检查消息msgID是否全部发送完毕
      if(sendingMessages[msgID].sentNum == Object.keys(sendingMessages[msgID].users).length){
        //写入sentMessages队列
        sentMessages[msgID] = sendingMessages[msgID];
        sentMessages[msgID].sentTime = Date.now();
        delete sendingMessages[msgID];
      }
    }
  };

  //获取在线用户的id
  this.getOnlineUsersID = function(){
    return Object.keys(onlineUsers);
  };



  return this;
}

//导出message模块
module.exports = message;