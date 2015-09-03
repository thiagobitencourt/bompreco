angular.module('bomprecotv').controller('produtosController', function(fileUpload, $scope, Produtos, categoriasService, produtosService){

	var produtos = $scope.produtos = Produtos.data;
	var categorias = [];
	var updating = false;

	var loadCategorias = function(){
		categoriasService.getCategorias().success(function(data){

			categorias = $scope.categorias = data;

			angular.forEach(categorias, function(categoria){
				angular.forEach(produtos, function(produto){
					if(produto.categoria == categoria._id){
						produto.categoriaNome = categoria.categoria;
						return;
					}
				});
			});

		}).error(function(data){
			console.log(data);
		});
	}

	var loadProdutos = function(){

		produtosService.getProdutos().success(function(data){

			produtos = $scope.produtos = data;
			loadCategorias();

		}).error(function(data){
			console.log(data);
		});

	}

	$scope.editar = function(produto){
		$scope.novoProduto = produto;

		angular.forEach(categorias, function(categoria){
			if(categoria._id == produto.categoria){
				$scope.paraCategoria = categoria;
				return;
			}
		});

		$scope.showProdutoForm = true;
		updating = true;
	}

	$scope.excluir = function(produto){
		// console.log(produto);

		produtosService.deleteProduto(produto._id).success(function(data){
			loadProdutos();
		}).error(function(data){

		});
	}

	$scope.criarNovoProduto = function(novoProduto){

		if(!novoProduto){
			delete $scope.novoProduto;
			delete $scope.produtoImagem;
			$scope.showProdutoForm = false;
			return;
		}

		var success = function(data){
			$scope.showProdutoForm = false;
			delete $scope.produtoImagem;
			loadProdutos();
		}

		var error = function(data){
			console.log(data);
		}

		novoProduto.categoria = $scope.paraCategoria._id;

		if(updating == true){
			if($scope.produtoImagem){
				var file = $scope.produtoImagem;
				fileUpload.uploadFile(file).success(function(data){
				novoProduto.imagem = data;
				console.log(novoProduto);
				produtosService.updateProduto(novoProduto).success(success).error(error);
			});
			}else{
				produtosService.updateProduto(novoProduto).success(success).error(error);
			}
		}else{
			var file = $scope.produtoImagem;
			fileUpload.uploadFile(file).success(function(data){
				novoProduto.imagem = data;
				console.log(novoProduto);
				produtosService.postProduto(novoProduto).success(success).error(error);
			});
		}
	}

	loadCategorias();
});