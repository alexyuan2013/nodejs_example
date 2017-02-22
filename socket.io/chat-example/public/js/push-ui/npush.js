angular.module('npush', ['ui.bootstrap']);
angular.module('npush', ['ui.bootstrap'])
.controller('NPushController', function($scope, $http){
  $scope.users=[];
  $http.get('http://localhost:3000/api/onlineusers/ipark').then(
    function(result){
      $scope.users = result.data || [];
      //$scope.users = ['00061543', '00064623'];
      //console.log(result);
    },
    function(error){
      $scope.users = [];
    }
  );

  $scope.sendingMessages = [];
  $http.get('http://localhost:3000/api/sendingmessages/ipark').then(
    function(result){
      $scope.sendingMessages = result.data || [];
      //console.log(result);
    },
    function(error){
      $scope.sendingMessages = [];
    }
  );

  $scope.sentMessages = [];
  $http.get('http://localhost:3000/api/sentmessages/ipark').then(
    function(result){
      $scope.sentMessages = result.data || [];
      //console.log(result);
    },
    function(error){
      $scope.sentMessages = [];
    }
  );

  $scope.submit = function() {
    var msg = {};
    msg.content = $scope.msgContent;
    msg.users = [];
    msg.users = $scope.msgUsers.split(';');
    console.log(msg);
    $http.post('http://localhost:3000/api/message/ipark', msg).then(
      function(result){
        console.log(result);
      },
      function(error){}
    );

  };
  

});