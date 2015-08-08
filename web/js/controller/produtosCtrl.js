angular.module("bompreco").controller('produtosCtrl', function ($scope, $location, produtos, $http) {
    
    $scope.produtos = produtos.data;

    $scope.cadastrarProduto = function(produto){

    	produto.categoria = '55bc2cd804bdc8ae2ce030c4';
    	console.log("function: " + JSON.stringify(produto));
    	$scope.showProdutosForm = false;
    	
    	$http.post('http://localhost:8000/produtos', produto).success(function(data){
    		$scope.produtos = data;
    	});
    }
})
