angular.module('bomprecotv').controller('produtosController', function(fileUpload, $rootScope, $location, $modal, $scope, Produtos, categoriasService, produtosService){

	var produtos = $scope.produtos = Produtos.data;
	var categorias = [];
	var updating = false;
	$scope.showProdutoForm = false;
	$scope.unidadesMedidas = ['KG', 'LT', 'GR', 'UN', 'PÇ'];

	var openModalError = function(errorMessage){
		var modalInstance = $modal.open({
			animation: false,
			templateUrl: 'confirmModal.html',
			controller: 'ModalInstanceCtrl',
			size: 'sm',
			resolve: {
					titulo: function () {
						return errorMessage + '!';
					},
					ok: function() {
						return 'OK';
					},
					cancel: function(){
						return null;
					}
			}
		});

    // modalInstance.result.then(function (selectedItem) {
    //     // console.log("Modal Fechada");
    // }, function () {
    //     // console.info('Modal dismissed at: ' + new Date());
    // });
  }

	var loadCategorias = function(cb){
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

			cb();

		}).error(function(data){
			console.log(data);
			openModalError(data.message);
		});
	}

	var loadProdutos = function(){

		produtosService.getProdutos().success(function(data){

			produtos = $scope.produtos = data;
			loadCategorias(function(){});

		}).error(function(data){
			console.log(data);
			openModalError(data.message);
		});
	}

	var editarConfig = function(produto){
		configSemana(produto.valorEspecial);

		$scope.novoProduto = produto;

		angular.forEach($scope.categorias, function(categoria){
			if(categoria._id == produto.categoria){
				$scope.paraCategoria = categoria;
				return;
			}
		});

		$scope.showProdutoForm = true;
		updating = true;
	}

	$scope.editar = function(produto){

		//TODO: aqui tbm
		$rootScope.produto = produto;
		$location.path('/produtos/insert');

	/*
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
	*/
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
                },
                ok: function() {
                	return "Excluir";
                },
                cancel: function(){
                	return "Cancelar";
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

		//TODO: Arrumar aqui tbm.
		delete $rootScope.produto;
		$location.path('/produtos');
	}

	$scope.showForm = function(){

		//TODO: Arrumar esta gambia
		$location.path('/produtos/insert');
		// configSemana();
		// $scope.showProdutoForm = true;
	}

	$scope.criarNovoProduto = function(novoProduto){

		if(!novoProduto){
			clearForm();
			$scope.showProdutoForm = false;
			return;
		}

		var fatalError = false;
		novoProduto.valorEspecial = [];
		angular.forEach($scope.week, function(day){
			if(day.check){
				day.valor = day.valor.replace('R$','');
				if(day.valor === '0,00'){
					openModalError('Os valores usados não podem ser R$ 0,00');
					fatalError = true;
				}else{
					novoProduto.valorEspecial.push({dia: day.dia, valor: day.valor});
				}
			}
		});

		novoProduto.categoria = $scope.paraCategoria._id;
		novoProduto.valorPadrao = novoProduto.valorPadrao.replace('R$','');
		if(novoProduto.valorPadrao === '0,00'){
			openModalError('O valor do produto não pode ser R$ 0,00');
			fatalError = true;
		}

		if(fatalError)
			return;

		var success = function(data){
			$scope.showProdutoForm = false;
			clearForm();
			loadProdutos();
		}

		var error = function(data){
			console.log(data);
			openModalError(data.message);
		}

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
			if($scope.produtoImagem){
				var file = $scope.produtoImagem;
				fileUpload.uploadFile(file).success(function(data){
					novoProduto.imagem = data;
					produtosService.postProduto(novoProduto).success(success).error(error);
				}).error(function(data){
					openModalError("Erro ao salvar imagem!");
				});
			}else{
				produtosService.postProduto(novoProduto).success(success).error(error);
			}
		}
	}

	loadCategorias(function(){

		//TODO: Remover esta gambia. Maior gambia da história
		if($rootScope.produto){
			editarConfig($rootScope.produto);
		}else{
			configSemana();
		}

	});


});
