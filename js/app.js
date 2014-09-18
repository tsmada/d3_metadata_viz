var App = angular.module('SIMDOT', []);

App.controller('DataCtrl', function($scope, $http) {
  $http.get('outputtest.json')
       .then(function(res){
          $scope.todos = res.data;
          $scope.data = res.data;
        });

App.controller('TodoCtrl', function($scope, $http) {
  $http.get('output.json')
       .then(function(res){
          $scope.todos = res.data;
          $scope.data = res.data;
        });
});