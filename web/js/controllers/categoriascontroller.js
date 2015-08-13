angular.module('bomprecotv').controller('categoriasController', function($scope, Categorias, categoriasService, produtosService){

	var categorias = $scope.categorias = Categorias.data;
	var updating = false;

	var loadProdutosLength = function(categorias){
		angular.forEach(categorias, function(categoria){
			produtosService.getLengthByCategoria(categoria._id).success(function(data){
				categoria.produtos = data[0];
			});
		});
	}

	var loadCategorias = function(){
		categoriasService.getCategorias().success(function(data){
			
			categorias = $scope.categorias = data;
			loadProdutosLength(categorias);

		}).error(function(data){
			console.log(data);
		});
	};

	$scope.editar = function(categoria){
		$scope.novaCategoria = categoria;
		$scope.showCategoriaForm = true;
		updating = true;
		console.log(categoria);
	};

	$scope.excluir = function(categoria){
		categoriasService.deleteCategoria(categoria._id).success(function(data){
			loadCategorias();
		});
		console.log(categoria);
		// loadCategorias();
	};

	$scope.criarNovaCategoria = function(novaCategoria){
		if(!novaCategoria){
			delete $scope.novaCategoria;
			console.log("So volta...");
			$scope.showCategoriaForm = false;
			return;
		}

		var success = function(data){
			$scope.showCategoriaForm = false;
			loadCategorias();
		}

		var error = function(data){
			console.log(data);
		}

		if(updating == true){
			categoriasService.updateCategoria(novaCategoria).success(success).error(error);
		}else{
			categoriasService.postCategoria(novaCategoria).success(success).error(error);
		}
	}

	loadProdutosLength(categorias);
	console.log(categorias);
});