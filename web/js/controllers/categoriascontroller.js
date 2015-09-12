angular.module('bomprecotv').controller('categoriasController', function($scope, $modal, Categorias, categoriasService, produtosService){

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
	};

	$scope.excluir = function(categoria){

		var modalInstance = $modal.open({
            animation: false,
            templateUrl: 'confirmModal.html',
            controller: 'ModalInstanceCtrl',
            size: 'sm',
            resolve: {
                item: function () {
                  return categoria.categoria;
                }
            }
        });

        modalInstance.result.then(function (selectedItem) {
            //Verifica os produtos relacionados a esta categoria. Não pode excluir se houver produtos relacionados
			produtosService.getLengthByCategoria(categoria._id).success(function(data){
				if(data[0] == 0){
					categoriasService.deleteCategoria(categoria._id).success(function(data){
						loadCategorias();
					});
				}else{
					//TODO: Mensagem ao usuário.
					console.log("Não é possível escluir esta categoria. Existem produtos relacionados a ela.")
				}
			});
        }, function () {
            // console.info('Modal dismissed at: ' + new Date());
        });
	};

	$scope.criarNovaCategoria = function(novaCategoria){
		if(!novaCategoria){
			delete $scope.novaCategoria;
			$scope.showCategoriaForm = false;
			return;
		}

		var success = function(data){
			//Ao cadastrar uma categoria, recarrega as categorias e fecha o formulário
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

	//Carrega informação de quantos produtos tem nesta sessão.
	loadProdutosLength(categorias);
});