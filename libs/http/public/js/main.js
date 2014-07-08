"use strict";
var app = angular.module('bunny', []);
var $modal = $('.modal-logs');

app.run(function ($rootScope, $http) {
  $http.get('/bunnyconfigs').success(function (data) {
    $rootScope.configs = data;
    $rootScope.$emit('loadconfigs');
    
  })
});


function formatLog (data) {
  for (var id in data) {
    var item = data[id];
    if (item.logs) {
      for (var i = item.logs.length - 1; i >= 0; i--) {
        var log = item.logs[i];
        data[id].logs[i] = JSON.parse(log)
      };
    }
  }
}

app.controller("JobsCtrl", function($scope, $http, $rootScope,$sce){
  function getJobs () {
    var baseUrl = $rootScope.configs.baseUrl;
    $http.get(baseUrl + 'stats').success(function (data) {
      if (Object.keys(data).length == 0) {
        data = null;
      }
      formatLog(data);
      $scope.jobs = data;

    });
  };

  $rootScope.$on('loadconfigs',function(){
    getJobs()
    setInterval(getJobs, 2000);
    
  });
  $scope.logs = [];
    
  $scope.updateLog = function (id) {
    $scope.logs = $scope.jobs[id].logs
  }

  $scope.showModal = function (logs) {
    if(logs) $modal.modal();
  }


});

app.filter('toUTCDate', function(){
  return function(time) {
    time = JSON.parse(time); //invalid date if time is string
    return moment(time).utc().format('MMM DD HH:mm UTC')
  };
});



app.filter('to_trusted', function($sce){
  return function(text) {
    text = text.replace(/\n/g,'<br>');
    return $sce.trustAsHtml(text);
  };
});

app.filter('getlog', function() {
  return function(input) {
    return input.replace('\n','<br>')
  }})

$('div.logs, .modal-logs').on('click',function(){
  var isShow = $modal.data('modal').isShown
  if (isShow) {
    $modal.modal('hide')
    $('.modal-logs').animate({ scrollTop: 0},0 );
    
  }
});

$('body').tooltip({
    selector: '[data-toggle="tooltip"]'
});
