angular.module("bpTv")

.controller("tabelaController", 
function($scope, $rootScope, $timeout, $location, sessao, sessaoService, produtosService, categoriasService){

	var sessoes = sessao.data;

	var showFunction = function(categorias){
		var cat = categorias.shift();

		console.log(cat.tempo);

		categoriasService.getCategoria(cat._id).success(function(data){
			$scope.currentCategoria = data;

			console.log($scope.currentCategoria.categoria);
			
			produtosService.getProdutos($scope.currentCategoria._id).success(function(data){
				$scope.produtos = data;
			});
		});

		$timeout(function(){
			$location.path('/baners');
		}, cat.tempo * 1000);
	}

	if($rootScope.categorias && $rootScope.categorias.length > 0){
		
		showFunction($rootScope.categorias);

	}else{

		if($rootScope.categorias){
			/*
			Se houver a variavel rootScope.categorias, significa que não é a primeira execução. 
			Então recarrega a sessão para pegar alguma possível atualização.
			*/
			sessaoService.getSessao(sessoes._id).success(function(data){
				sessoes = data;
			});
		}
		
		$rootScope.categorias = sessoes.categorias;
		showFunction($rootScope.categorias);
	}
})

.controller("banersController", function($scope, $location, $timeout, sessao){

	var sessoes = sessao.data;

	$scope.produtos = sessoes.produtos;
	console.log(sessoes.produtos);

	// var showFunction = function(produtos){
	// 	var pro = produtos.shift();

	// 	console.log(pro.produto);

	// 	categoriasService.getCategoria(pro._id).success(function(data){
	// 		$scope.currentCategoria = data;

	// 		console.log($scope.currentCategoria.categoria);
			
	// 		produtosService.getProdutos($scope.currentCategoria._id).success(function(data){
	// 			$scope.produtos = data;
	// 		});
	// 	});

	// 	$timeout(function(){
	// 		$location.path('/baners');
	// 	}, pro.tempo * 1000);
	// }

	// if($rootScope.categorias && $rootScope.categorias.length > 0){
		
	// 	showFunction($rootScope.categorias);

	// }else{

	// 	if($rootScope.categorias){
	// 		/*
	// 		Se houver a variavel rootScope.categorias, significa que não é a primeira execução. 
	// 		Então recarrega a sessão para pegar alguma possível atualização.
	// 		*/
	// 		sessaoService.getSessao(sessoes._id).success(function(data){
	// 			sessoes = data;
	// 		});
	// 	}
		
	// 	$rootScope.categorias = sessoes.categorias;
	// 	showFunction($rootScope.categorias);
	// }

	$timeout(function(){

		$location.path('/tabela');

	}, 5000);

});