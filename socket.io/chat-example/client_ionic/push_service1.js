angular.module('pushService', [])

.factory('socket',['socketFactory',function(socketFactory){
	var myIoSocket = io.connect('http://www.smartnari.com:3001/',{});
	//var myIoSocket = io.connect('http://www.smartnari.com:3000/',{});
	//var myIoSocket = io.connect('http://172.28.112.101:3000/',{});

  	mySocket = socketFactory({
    	ioSocket: myIoSocket
  	});
  	
	return mySocket;
}])
.factory('new_messages',[function(){
	var recv_data=[];
	return {
		setMessages:function(messages){
			recv_data=[];
			for(var i=0;i<messages.length;i++){
				recv_data[i]=messages[i];
			}
		},
		getMessages:function(){
			return recv_data;
		}
	}
}])
.factory('IDStorage',[function(){
	var msgIds=[];
	var msgTimes=[];
	var earlist=0;
	//todo
	//sync the msgIds to storage
	var syncIds=function(){
		console.log('sync ids');
	}
	return {
		//update the earlist message id and the msgIds
		updateIds:function(){
			console.log('update ids');
			var yesterday=new Date().getTime()-24*3600*1000;
			for(var i=0;i<msgTimes.length;i++){
				//too old!
				if(msgTimes[i]<yesterday){
					console.log('To delete:'+new Date(msgTimes[i]));
					msgIds.splice(i,1);
					msgTimes.splice(i,1);
					i--;
				}else{
					//find the legal earlist one
					if(msgTimes[i]<earlist)
						earlist=msgTimes[i];
				}
			}
			//sync the update to the storage
			syncIds();
		},
		//ignore too old or repeatted message id 
		handleMessageId:function(mid,mtime){
			//too early?Ignore it!
			if(mtime<earlist)
				return false;
			//repeatted?Ignore it!
			if(msgIds.indexOf(mid)>=0)
				return false;
			//add this one in msgIds
			msgIds.push(mid);
			msgTimes.push(mtime);
			//sync the msgIds to the storage
			syncIds();
			
			return true;
		}
	}
}])
.factory('nari_push',['$rootScope','socket','new_messages','IDStorage','$window','$ionicPlatform','$cordovaLocalNotification',
'$cordovaBadge',
function($rootScope,socket,new_messages,IDStorage,$window,$ionicPlatform,$cordovaLocalNotification,$cordovaBadge){
	var pending=[];
	var uid='';
	var backgroundMode=false;
	var mCount=0;
	//
	var triggerClick=null;
	var clickOpts={};
	//
	var logout=false;
	
	var broadcastNum=0;
	
	var doLogin=function(){
		if(uid){
			var msg={userID:uid};
			socket.emit('login',msg);
		}else{
			uid=$window.localStorage.getItem('pushUid') || null;
			if(uid){
				var msg={userID:uid};
				socket.emit('login',msg);
			}
		}
	};
	return {
		init:function(){
			socket.on('connect',function(){
				console.log('app connect!');
				doLogin();
			});
			socket.on('disconnect',function(){
				console.log('app disconnect!');
				
			});
			socket.on('reconnect',function(number){
				console.log('app reconnect!');
				console.log(number);
			});
			socket.on('reconnect_error',function(error){
				console.log('app reconnection error!');
				console.log(error);
			});
		},
		login:function(userId){
			if(logout){
				//console.log('Having done logout deed!');
				//socket.connect();
			}
			uid=userId;
			$window.localStorage.setItem('pushUid', typeof userId == 'object' ? JSON.stringify(userId) : userId);
			doLogin();
		},
		logout:function(){
			var msg={userID:uid};
			socket.emit('logout',msg);
		},
		setBackgroundReady:function(options){
			// Enable background mode
			cordova.plugins.backgroundMode.enable();
			cordova.plugins.backgroundMode.setDefaults(options);
			cordova.plugins.backgroundMode.onactivate = function(){
				backgroundMode=true;
				mCount=0;
				console.log('background model!+1s');
			};
			cordova.plugins.backgroundMode.ondeactivate = function(){
				backgroundMode=false;
				console.log('background model end!');
				if(ionic.Platform.isIOS()){
				$cordovaLocalNotification.cancel(1).then(function(){
					mCount=0;
					$cordovaBadge.set(0).then(function() {
					// You have permission, badge set.
					}, function(err) {
					// You do not have permission.
					console.log(err);
					});
					//if(triggerClick && typeof triggerClick==='function')
						//triggerClick(clickOpts);
				});
				}
				
				if(ionic.Platform.isAndroid()){
					cordova.plugins.backgroundMode.cancelNotification(1);
				}
				
			}
			/*$rootScope.$on('$cordovaLocalNotification:click',function(notification,state){
				console.log('Triggered click notification in app!');
				triggerClick(clickOpts);
			})*/
		},
		waitMessages:function(showDefaultNotification){
			if(showDefaultNotification==undefined){
				showDefaultNotification=true;
			}
			//logout succeed,further do
			socket.on('logoutSucceed',function(){
				logout=true;
				$window.localStorage.removeItem('pushUid');
				uid='';
				//socket.disconnect();
			});
			//login succeed,further do
			socket.on('loginSucceed',function(){
				logout=false;
				//set background ready
				//setBackgroundReady();
				//P2P message
				socket.on('newMessage',function(msg){
					console.log('Msg ID:'+msg.msgID);
					if(IDStorage.handleMessageId(msg.msgID,msg.time)){
						console.log('Receive this message!');
						console.log(msg);
						pending.push(msg);
					}
					var receipt={userID:uid,msgID:msg.msgID};
					socket.emit('receipt',receipt);
				});
				//end of p2p message
				socket.on('EOM',function(msg){
					console.log('End of this batch of messages!');
					new_messages.setMessages(pending);
					
					var dataNum=pending.length;
					mCount+=dataNum;
					
					pending=[];
					$rootScope.$broadcast('newMessages','');
					//update the ids and sync the ids to storage
					IDStorage.updateIds();
					//show notification if background
					if(backgroundMode && showDefaultNotification){
						$ionicPlatform.ready(function() {
							if(ionic.Platform.isAndroid()){
							cordova.plugins.backgroundMode.showNotification({
								nid:1,
								title:uid+'：新消息提醒！',
								text:'新消息'+mCount+'条'
							});
							}
							if(ionic.Platform.isIOS()){
							$cordovaLocalNotification.schedule({
								id:1,
								title:uid+'：新消息提醒！',
								text:'新消息'+mCount+'条'
							}).then(function(result){
								$cordovaBadge.set(mCount).then(function() {
								// You have permission, badge set.
								}, function(err) {
								// You do not have permission.
								console.log(err);
								});
							});
							}
						});
					}
				});
				//wait for broadcast
				socket.on('ALL',function(msg){
					broadcastNum++;
					console.log('Receive Baordcast Message!Count:'+broadcastNum);
					$rootScope.$broadcast('broadcastMessages',msg);
				});
				//Server can send message now
				socket.emit('beginSession',{userID:uid});
				console.log('Ready to receive push data!');
			});
		},
		setTrigger:function(triggerFunc,triggerOpts){
			triggerClick=triggerFunc;
			clickOpts=triggerOpts;
		},
		getUnreadCount:function(){
			return mCount;
		}
		
	}
	
}])