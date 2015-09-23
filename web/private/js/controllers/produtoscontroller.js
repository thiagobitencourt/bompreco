angular.module('bomprecotv').controller('produtosController', function(fileUpload, $modal, $scope, Produtos, categoriasService, produtosService){

	var produtos = $scope.produtos = Produtos.data;
	var categorias = [];
	var updating = false;
	$scope.showProdutoForm = false;
	$scope.unidadesMedidas = ['kg', 'lt', 'gr', 'un', 'pe'];

	var openModalError = function(errorMessage){

        var modalInstance = $modal.open({
            animation: false,
            templateUrl: 'errorModal.html',
            controller: 'ModalInstanceCtrl',
            size: 'sm',
            resolve: {
                titulo: function () {
                  return errorMessage;
                }
            }
        });

        modalInstance.result.then(function (selectedItem) {
            console.log("Modal Fechada");
        }, function () {
            // console.info('Modal dismissed at: ' + new Date());
        });
    }

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
			openModalError(data.message);
		});
	}

	var loadProdutos = function(){

		produtosService.getProdutos().success(function(data){

			produtos = $scope.produtos = data;
			loadCategorias();

		}).error(function(data){
			console.log(data);
			openModalError(data.message);
		});
	}

	$scope.editar = function(produto){

		configSemana(produto.valorEspecial);

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
		var modalInstance = $modal.open({
            animation: false,
            templateUrl: 'confirmModal.html',
            controller: 'ModalInstanceCtrl',
            size: 'sm',
            resolve: {
                titulo: function () {
                  return "Deseja excluir " + produto.nome + "?";
                }
            }
        });

        modalInstance.result.then(function (selectedItem) {
			produtosService.deleteProduto(produto._id).success(function(data){
				loadProdutos();
			}).error(function(data){
				openModalError(data.message);
			});
        }, function () {
            // console.info('Modal dismissed at: ' + new Date());
        });
	}

	var configSemana = function(semana){

		if(semana){
			var hasSemana = true;
		}

		var d = $scope.week = [];
		var weekDay = new Array(7);
	    weekDay[0] = "segunda-feira";
	    weekDay[1] = "terça-feira"; 
	    weekDay[2] = "quarta-feira";
		weekDay[3] = "quinta-feira";
		weekDay[4] = "sexta-feira";
		weekDay[5] = "sábado";
		weekDay[6] = "domingo";

		var defObj = function(day){
			var obj = {};
			obj.valor = null;
			obj.check = false;
			obj.dia = day;
			return obj;
		}

		var it = 0;
		angular.forEach(weekDay, function(day){
			
			if(hasSemana){
				if(semana[it] && semana[it].dia == day){
					var obj = {};
					obj.valor = semana[it].valor;
					obj.check = true;
					obj.dia = semana[it].dia;

					d.push(obj);
					it++;
				}else{
					d.push(defObj(day));	
				}
			}else{
				d.push(defObj(day));
			}
		});
	}

	var clearForm = function(){
		var opFile = "opFile";
    	document.getElementById(opFile).innerHTML = document.getElementById(opFile).innerHTML;

    	delete $scope.paraCategoria;
    	delete $scope.novoProduto;
		delete $scope.produtoImagem;
	}

	$scope.showForm = function(){
		$scope.showProdutoForm = true;

		configSemana();
	}

	$scope.criarNovoProduto = function(novoProduto){

		if(!novoProduto){
			clearForm();
			$scope.showProdutoForm = false;
			return;
		}

		novoProduto.valorEspecial = [];
		angular.forEach($scope.week, function(day){
			if(day.check){
				day.valor = day.valor.replace('R$','');
				novoProduto.valorEspecial.push({dia: day.dia, valor: day.valor});				
			}
		});

		var success = function(data){
			$scope.showProdutoForm = false;
			clearForm();
			loadProdutos();
		}

		var error = function(data){
			console.log(data);
			openModalError(data.message);
		}

		novoProduto.categoria = $scope.paraCategoria._id;
		novoProduto.valorPadrao = novoProduto.valorPadrao.replace('R$','');

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
			}).error(function(data){
				openModalError("Erro ao salvar imagem!");
			});
		}
	}

	loadCategorias();
});