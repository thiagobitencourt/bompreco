angular.module("bompreco").controller('categoriasCtrl', function ($scope, $location, categorias, $http) {

	$scope.categorias = categorias.data;

	$scope.detalhar = function(categoria){

		$scope.categoriaAtual = categoria;
		delete $scope.error;
		$scope.needProduto = false;

		console.log("Detalhar categoria com ID " + categoria._id);
		$http.get('http://localhost:8000/produtos/categoria/' + categoria._id).success(function(data, status){
			console.log("Produtos encontratdos: " + JSON.stringify(data));
			
			if(data.length > 0){
				$scope.produtos = data;
				$scope.showDetalhes = true;
			}else{
				$scope.needProduto = true;
				$scope.error = "Nenhum produto encontrado";
			}

		}).error(function(status, data){
			$scope.error = data;
		});
	}

	$scope.showTodas = function(todas){
		if(todas){
			$http.get('http://localhost:8000/categorias/all').success(function(data, status){
				$scope.categorias = data;
			});
		}else{
			$http.get('http://localhost:8000/categorias').success(function(data, status){
				$scope.categorias = data;
			});
		}
	}

	$scope.ativarCategoria = function(categoria){
		categoria.ativa = true;
	}

	$scope.excluirCategoria = function(categoria){
		categoria.ativa = false;
	}

	$scope.produtosForm = function(prCategoria){
		console.log(prCategoria);
		$scope.showProdutosForm = true;
	}

	$scope.cancelarCadastroProduto = function(){
		$scope.showProdutosForm = false;
		$scope.needProduto = false;
		delete $scope.error;
	}

	$scope.fecharDetalhes = function(){
		$scope.showDetalhes = false;
		$scope.needProduto = false;
		delete $scope.error;
		delete $scope.produtos;
	}

	$scope.cadastrarProduto = function(produto){
		produto.categoria = $scope.categoriaAtual._id;

		console.log(produto);

		$http.post('http://localhost:8000/produtos', produto).success(function(data, status){
			
			$scope.showProdutosForm = false;
			$scope.needProduto = false;
			delete $scope.error;
			
			$scope.detalhar($scope.categoriaAtual);
		}).error(function(data, status){
			console.log(data);
		});

	}

	$scope.cadastrarCategoria = function(novaCategoria){
		console.log(novaCategoria);
		$http.post('http://localhost:8000/categorias', novaCategoria).success(function(data, status){
			$scope.showTodas(false);
		}).error(function(data, status){
			$scope.error = "Erro ao cadastrar nova categoria: " + data;
		});
	}
});
