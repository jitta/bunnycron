"use strict";
var app = angular.module('bunny', []);
var $modal = $('.modal-logs');
var $modalFullLog = $('.modal-log');


app.service('JobsService', function() {
  var logs, fullLog = undefined;

  return {
    fullLog: {
      data: '',
      completedAt: null
    },
    setFullLog: function setFullLog(logData) {
      fullLog = logData
    },
    setLogs: function setLogs(_logs) {
      logs = _logs;
    },
    getLogs: function getLogs() {
      return logs;
    },
    getFullLog: function getFullLog() {
      return fullLog;
    }
  };

});


app.controller("JobsCtrl", function($scope, $http, $rootScope, $sce, JobsService){
  $scope.loading = true;
  function getJobs () {
    $http.get('stats').success(function (data) {
      $scope.loading = false;
      if (Object.keys(data).length == 0) {
        data = null;
      }
      JobsService.setLogs(data);
      $scope.jobs = data;

    });
  };
  function getConfig () {
    $http.get('config').success(function (config) {
      $scope.config = config;
    });
  };

  getJobs();
  getConfig();
  setInterval(getJobs, 10000);

  $scope.logs = [];

  $scope.showLogs = function (id) {
    var job = $scope.jobs.find( (item)=> {return item.id == id})
    $scope.modalHeader = job.command;
    $scope.logs = null;
    $scope.loadingLog = true;
    var url = 'logs/' + id;
    $http.get(url).success(function (data) {
      $scope.loadingLog = false;
      $scope.logs = data;
    });

  }

  $scope.showModal = function (log) {
    if(log) $modal.modal();
  }


});

app.controller("LogCtrl", function($scope, JobsService){

  $scope.getLogClass = function(status) {
    switch(status){
      case 'failed':
        return 'panel-danger'
        break;
      case 'timeout':
        return 'panel-warning'
        break;
      case 'completed':
        return 'panel-success'
        break;
      default:
        return 'panel-info'
    };
  };

  $scope.isTrim = function(log, maxLine) {
    var split = log.data.split('\n');
    if (split.length > maxLine) {
      return true;
    }else {
      return false;
    }
  };

  $scope.trimLog = function(log, maxLine) {
    log = log.split('\n').slice(0, maxLine).join('\n')
    return log

  };

  $scope.showFullLog = function(log) {
    JobsService.fullLog.data = log.data;
    JobsService.fullLog.completedAt = log.completedAt;
    $modal.modal('hide');
    setTimeout(function(){$modalFullLog.modal();}, 700)

  }

});

app.controller("FullLogCtrl", function($scope, JobsService){
  $scope.fullLog = JobsService.fullLog
  $scope.back = function() {
    $modalFullLog.modal('hide');
    setTimeout(function(){$modal.modal();}, 700)
  };

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

$('body').tooltip({
    selector: '[data-toggle="tooltip"]'
});
