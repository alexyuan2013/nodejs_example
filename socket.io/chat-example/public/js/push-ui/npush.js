angular.module('npush', ['ui.bootstrap']);
angular.module('npush', ['ui.bootstrap'])
.controller('NPushController', function($scope, $http){
  $scope.users=[];
  $scope.page1 = {};
  $scope.page1.start = 0;
  $scope.page1.size = 10;
  $scope.selectPage1 = function(){
    $http.get('/api/onlineusers/ipark').then(
      function(result){
        $scope.users = result.data || [];
        $scope.pageUsers = $scope.users.slice($scope.page1.start, $scope.page1.start + $scope.page1.size);
        //$scope.users = ['00061543', '00064623'];
        //console.log(result);
      },
      function(error){
        $scope.users = [];
      }
    );
  };
  
  $scope.$watch('page1.index', function(newValue, oldValue){
    console.log(newValue);
    if(newValue){
      $scope.page1.start = $scope.page1.size * (newValue - 1);
      $scope.pageUsers = $scope.users.slice($scope.page1.start, $scope.page1.start + $scope.page1.size);
    }
  });

  $scope.sendingMessages = [];
  $scope.page2 = {};
  $scope.page2.start = 0;
  $scope.page2.size = 10;
  $scope.selectPage2 = function(){
    $http.get('/api/sendingmessages/ipark').then(
      function(result){
        $scope.sendingMessages = result.data || [];
        $scope.sendingMsgs = $scope.sendingMessages.slice($scope.page2.start, $scope.page2.start + $scope.page2.size);
        //console.log(result);
      },
      function(error){
        $scope.sendingMessages = [];
      }
    );
  };

  $scope.$watch('page2.index', function(newValue, oldValue){
    console.log(newValue);
    if(newValue){
      $scope.page2.start = $scope.page2.size * (newValue - 1);
      $scope.sendingMsgs = $scope.sendingMessages.slice($scope.page2.start, $scope.page2.start + $scope.page2.size);
    }
  });

  $scope.sentMessages = [];
  $scope.page3 = {};
  $scope.page3.start = 0;
  $scope.page3.size = 10;
  $scope.selectPage3 = function(){
    $http.get('/api/sentmessages/ipark').then(
      function(result){
        $scope.sentMessages = result.data || [];
        $scope.sentMsgs = $scope.sentMessages.slice($scope.page3.start, $scope.page3.start + $scope.page3.size);
        //console.log(result);
      },
      function(error){
        $scope.sentMessages = [];
      }
    );
  };
  
  $scope.$watch('page3.index', function(newValue, oldValue){
    console.log(newValue);
    if(newValue){
      $scope.page3.start = $scope.page3.size * (newValue-1);
      $scope.sentMsgs = $scope.sentMessages.slice($scope.page3.start, $scope.page3.start + $scope.page3.size);
    } 
    
  });

  $scope.submit = function() {
    var msg = {};
    msg.content = $scope.msgContent;
    msg.users = [];
    msg.users = $scope.msgUsers.split(';');
    console.log(msg);
    $http.post('/api/message/ipark', msg).then(
      function(result){
        console.log(result);
      },
      function(error){}
    );

  };
  

});