angular.module("bompreco").controller('mainCtrl', function ($scope, $location) {

    console.log("hora" + new Date());

    $scope.agora = new Date();

    $scope.goToTv = function(){
      $location.path('/tv');
    }

    $scope.goToCategorias = function(){
      $location.path('/categorias'); 
    }

    $scope.goToProdutos = function(){
      $location.path('/produtos'); 
    }
});