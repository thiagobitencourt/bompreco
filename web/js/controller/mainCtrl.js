angular.module("bompreco").controller('mainCtrl', function ($scope, $location) {

    console.log("hora" + new Date());

    $scope.agora = new Date();

    $scope.goToTv = function(){
      $location.path('/tv');
    }

    $scope.goToLogin = function(){
      $scope.hasUser = true;
      $scope.userName = "Thiago";
      // $location.path('/login');
    }

    $scope.goToLogout = function(){
      $scope.hasUser = false;
      delete $scope.userName;
    }

    $scope.goToCategorias = function(){
      $location.path('/categorias'); 
    }

    $scope.goToProdutos = function(){
      $location.path('/produtos'); 
    }

    $scope.goToTestes = function(){
     $location.path('/testes');  
    }
});