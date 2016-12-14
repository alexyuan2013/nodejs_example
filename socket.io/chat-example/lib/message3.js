/**
 * message版本3——使用mongodb存储
 */
function message(){
  var constants = require('./constants.js');
  var MongoClient = require('mongodb').MongoClient;
  var url = 'mongodb://172.28.112.98:27017/pushdb';
  var args = process.argv.slice(2);//获取启动参数
  var countID = Date.now(); //自增长的id

  //增、删、改操作成功后的回掉函数，关闭数据链接，debug模式下打印结果信息
  var callback = function(result, db){
    if(args=='debug'){
      console.log(result);
    }
    db.close();
  };

  //插入数据到mongodb
  var insertDocument = function(db, collection, doc, callback) {
    // Get the documents collection
    var coll = db.collection(collection);
    // Insert some documents
    coll.insertOne(doc, function(err, result) {
      if(args=='debug'){
        console.log("Inserted 1 document into the document collection");
      }
      callback(result, db);
    });
  };

  //从mongodb中查询数据
  var findDocuments = function(db, collection, queryObj, callback) {
    // Get the documents collection
    var coll = db.collection(collection);
    // Find some documents
    coll.find(queryObj).toArray(function(err, docs) {
      callback(docs, db);
    });
  };
  //更新数据
  var updateDocument = function(db, collection, queryObj, updateObj, callback) {
    // Get the documents collection
    var coll = db.collection(collection);
    // Update document where a is 2, set b equal to 1
    coll.updateOne(queryObj, updateObj, function(err, result) {
      if(args=='debug'){
        console.log("Updated 1 document");
      }
      callback(result,db);
    });  
  };
  //删除数据
  var removeDocument = function(db, collection, queryObj, callback) {
    // Get the documents collection
    var coll = db.collection(collection);
    // Remove some documents
    coll.deleteOne(queryObj, function(err, result) {
      console.log("Removed the document");
      callback(result, db);
    });    
  };

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
    var msgObj = {}; //mongodb中消息体
    //msgObj.msgID = Date.now();
    msgObj.msgID = countID++;
    msgObj.content = content;
    msgObj.sentNum = 0; 
    var usersObj = [];
    for(var u in users){
      var userObj = {};
      userObj.uID = users[u];
      userObj.state = 0;
      usersObj.push(userObj);
    }
    msgObj.users = usersObj;
    //写入到mongodb中
    MongoClient.connect(url, function(err, db) {
      console.log("Connected correctly to server");
      insertDocument(db, 'sending_messages', msgObj, callback);
    });
    //向在线用户发送
    for(var u in users){
      //用户在线
      if(onlineUsers[users[u]] != undefined){
        onlineUsers[users[u]].emit('newMessage', {msgID: msgObj.msgID, data: msgObj.content, time: Date.now()});
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
    MongoClient.connect(url, function(err, db) {
      console.log("Connected correctly to server");
      findDocuments(db, 'sending_messages', {users:{"$in":[{uID:user,state:0}]}}, function(docs, db){
        docs.forEach(function(doc, i){
          if(onlineUsers[user] != undefined){
            onlineUsers[user].emit('newMessage', {msgID: doc.msgID, data: doc.content, time: Date.now()});
            count=count+1;
          }
          if(count>0 && (i==docs.length-1 || count%constants.EOM_NUM == 0)) {
            onlineUsers[user].emit('EOM', {});
          }
        });
        db.close();
      });
    });
  };
  /**
   * 收到消息回执后的处理
   * userID: user_id1
   * msgID: message_id1
   */
  this.receiptMessage = function(userID, messageID){
    MongoClient.connect(url, function(err, db) {
      console.log("Connected correctly to server");
      updateDocument(db, 'sending_messages', 
        {msgID:messageID, "users.uID":userID, "users.state":0}, 
        {$inc : {"users.$.state" : 1, sentNum:1}},
        function(result, db){
          findDocuments(db, 'sending_messages', {msgID:messageID}, function(docs, db){
          docs.forEach(function(doc, i){
            if(doc.users != undefined && doc.sentNum==Object.keys(doc.users).length){
              doc.sentTime = Date.now();
              insertDocument(db, 'sent_messages', doc, callback);
              removeDocument(db, 'sending_messages', {msgID:messageID}, callback);
            }
          });
          db.close();
        });
        }
      );
    });
  };

  //获取在线用户的id
  this.getOnlineUsersID = function(){
    return Object.keys(onlineUsers);
  };

  //获取未发消息列表
  this.getSendingMessages = function(callback){
   MongoClient.connect(url, function(err, db){
     console.log("Connected correctly to server");
     var coll = db.collection('sending_messages');
     coll.find().sort({'msgID': -1}).toArray(function(err, docs){
       callback(docs);
       db.close();
     });
   });
  };

  //获取已发消息列表
  this.getSentMessages = function(start, stop, callback){
    MongoClient.connect(url, function(err, db){
     console.log("Connected correctly to server");
     var coll = db.collection('sent_messages');
     coll.find().sort({'msgID': -1}).skip(start).limit(stop-start).toArray(function(err, docs){
       callback(docs);
       db.close();
     });
   });
  };

  
  return this;
}

//导出message模块
module.exports = message;