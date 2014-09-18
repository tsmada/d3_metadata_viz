var App = angular.module('SIMDOT', []);

App.controller('TodoCtrl', function($scope, $http) {
  $http.get('output.json')
       .then(function(res){
          $scope.todos = res.data;
        });
});