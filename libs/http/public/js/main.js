"use strict";
var app = angular.module('bunny', []);
var $modal = $('.modal-logs');

app.controller("JobsCtrl", function($scope, $http, $rootScope,$sce){
  $scope.logs = [];
  function getJobs () {
    // console.log('getjobs')
    $http.get('/stats').success(function (data) {
      $scope.jobs = data;
    });
  };
  getJobs()
  setInterval(getJobs,2000);
    
  $scope.updateLog = function (id) {
    $scope.logs = $scope.jobs[id].logs
  }

  $scope.showModal = function (logs) {
    if(logs) $modal.modal();
  }

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
})