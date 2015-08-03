angular.module("bompreco").controller('produtosCtrl', function ($scope, $location, produtos) {
    
    $scope.produtos = produtos.data;
})
