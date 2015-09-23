angular.module('bomprecotv').controller('homeController', function($scope, $cookies, $http){

    $http.get(window.location.origin + '/session').success(function(data){
        console.log(data);
        $scope.user = data;
    });
});