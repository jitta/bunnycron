"use strict";
var app = angular.module('bunny', []);
var $modal = $('.modal-logs');

app.controller("JobsCtrl", function($scope, $http, $rootScope){
  $scope.logs = [];
  $http.get('/stats').success(function (data) {
    $scope.jobs = data
    console.log(data)
  });
  $scope.updateLog = function (id) {
    $scope.logs = $scope.jobs[id].logs
  }

  $scope.showModal = function () {
    $modal.modal();
  }

})

$('div.logs').on('click',function(){
  var isShow = $modal.data('modal').isShown
  if (isShow) {
    $modal.modal('hide')
    $('.modal-logs').animate({ scrollTop: 0},0 );
    
  }
})