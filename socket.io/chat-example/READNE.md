# 消息推送的试验模块

## 1. 内部接口

* `login`

客户端与服务端建立连接后，要触发一个`login`事件，将用户信息发送到服务端，消息体的格式暂定为：
```json
{
  "appID": "ipark",
  "userID": "userid"
}
```

* `loginSucceed`

服务端在login事件响应后，会emit一个loginSucceed事件到客户端，以通知客户端已经登录成功，消息体暂定为空。
```json
{

}
```

* `logout`

客户端与服务端断开连接（实际上连接没有断开，只是注销了用户），客户端要触发一个`logout`事件，消息体的格式暂定为：
```json
{
  "appID": "ipark",
  "userID": "userid"
}
```

* `logoutSucceed`

服务端再logout事件后，会emit一个logoutSuccedd事件到客户端，以通知客户端已经断开连接，消息体暂定为空：
```json
{
  
}
```

* `beginSession`

客户端在收到loginSucceed事件后，向服务端emit一个beginSession事件，表示客户端已经准备好接收消息。消息体的格式暂定为：
```json
{
  "appID": "ipark",
  "userID": "userid"
}
```

* `newMessage`

服务端发送消息，客户端需要监听`newMessage`事件，消息体的格式暂定为
```json
{
  "appID": "ipark",
  "msgID": "1478488134224", //id为时间戳，单位为毫秒
  "data": "object" //数据格式由用户定义，这里只做转发
}
```
* `receipt`

客户端收到消息后，要向服务端发送回执，即`emit`一个`receipt`事件，消息体的格式暂定为：
```json
{
  "appID": "ipark",
  "userID": "userid", //用户id
  "msgID": "1478488134224" //消息id
}
```
* `EOM`

服务端在向单个用户连续发送信息时，每隔100条会触发一个End of Message，EOM事件，消息体的格式暂定为：
```json
{
  
}
```

* `ALL`

广播事件，服务端主动推送给在线用户，客户端自己根据消息体的内容解析消息具体输入何种类型。
```json
{

}
```

## 2. 外部接口（REST接口）

* 获取使用推送的应用id
  * url: http://172.28.112.42:3000/api/apps
  * 方法：get
  * 参数：无
  * 返回：
  ```json
  [
    "ipark",
    "ipark2"
  ]
  ```
* 添加应用
  * url：http://172.28.112.42:3000/api/add_app
  * 方法：post
  * 参数：
  ```json
  {
    "appID": "ipark2"
  }
  ```
  * 返回：
  ```json
  //正常返回状态码：200
  //出错时返回
  {
    "error": "error info"
  }
  ```


* 获取某个应用的在线用户
  * url: http://172.28.112.42:3000/api/onlineUsers/:appid
  ```
  示例：获取ipark的在线用户
  http://172.28.112.42:3000/api/onlineUsers/ipark
  ```
  * 方法：get
  * 参数：无
  * 返回：
  ```json
  [
    "00060924",
    "a76d-0f68-3d69-1251-744a"
  ]
  ```

* 向某个应用的用户发送消息
  * url: http://172.28.112.42:3000/api/message/:appid
  ```
  示例：向ipark的用户发送消息
  http://172.28.112.42:3000/api/message/ipark
  ```
  * 方法：post
  * 参数：
  ```json
  {
    "users":["00060924", "00061543"], 
    "content":"test" //content的内容也可以是json object
  }
  ```
  * 返回：
  ```json
  //正常返回状态码：200
  //出错时返回
  {
    "error": "error info"
  }
  ```
* 向某个应用的在线用户广播数据
   * url: http://172.28.112.42:3000/api/broadcast/:appid
   ```
   示例：向ipark的在线用户广播
   http://172.28.112.42:3000/api/broadcast/ipark
   ```
   * 方法：post
   * 参数：
   ```json
   {
     //任意json object
   }
   ```
   * 返回：
   ```json
   状态码：200 或其他
   ```
* 返回某个应用的未发送消息列表
  * url: http://172.28.112.42:3000/api/sendingMessages/:appid
  ```
  示例：获取ipark的未发送消息列表
  http://172.28.112.42:3000/api/sendingMessages/ipark
  ```
  * 方法：get
  * 参数：无
  * 返回：
  ```json
  {
    "1479280768113": { //消息id， 时间戳
      "content": "test",
      "users": {
        "00060924": 1,
        "a76d-0f68-3d69-1251-744a": 0
      },
      "sentNum": 1
    },
    "1479280769702": {
      "content": "test",
      "users": {
        "00060924": 1,
        "a76d-0f68-3d69-1251-744a": 0
      },
      "sentNum": 1
    }
  }
  ```
* 返回某个应用已发送消息列表（最多1000条）
  * url: http://172.28.112.42:3000/api/sentMessages/:appid
  ```
  示例：获取ipark的发送消息列表，不分页
  http://172.28.112.42:3000/api/sentMessages/ipark
  ```
  * 方法：get
  * 参数：无
  * 返回：
  ```json
  {
    "1479262289643": {
      "content": "test",
      "users": {
        "00060924": 1
      },
      "sentNum": 1,
      "sentTime": 1479262334110
    },
    "1479262290578": {
      "content": "test",
      "users": {
        "00060924": 1
      },
      "sentNum": 1,
      "sentTime": 1479262334116
    }
  }
  ``` 
* 返回已发送消息列表——分页返回（每页100条）
  * url: http://172.28.112.42:3000/api/sentMessages/:appid/pages/1（返回第一页）
  ```
  示例：获取ipark已发送消息列表的第一页
  http://172.28.112.42:3000/api/sentMessages/ipark/pages/1
  ```
  * 方法：get
  * 参数：无
  * 返回：
  ```json
  {
    "1479262289643": {
      "content": "test",
      "users": {
        "00060924": 1
      },
      "sentNum": 1,
      "sentTime": 1479262334110
    },
    "1479262290578": {
      "content": "test",
      "users": {
        "00060924": 1
      },
      "sentNum": 1,
      "sentTime": 1479262334116
    },
    //...
  }
  ``` 