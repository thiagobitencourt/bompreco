angular.module("bpTv")

.controller("tabelaController",
function($scope, $rootScope, $timeout, $location, $routeParams, sharedData, sessaoService, produtosService, categoriasService, defineValor){

	var sessao = null;

	var getSessao = function(nomeSessao){
		sessaoService.getSessao(nomeSessao).success(function(data){
			sessao = data;
			sharedData.set('sessao', sessao);
			configCategorias(sessao.categorias);
		});
	}

	var configSes = function(sessao){

		var nomeSessao = null;
		//Será um usado no futuro, talvez próximo.
		if($routeParams.sessao){
			var nomeSessao = $routeParams.sessao;
			// console.log("Usar sessão: " + $routeParams.sessao);
		}else{
			// console.log("Usar sessão Padrão");
		}

		if(sharedData.has('sessao')){
			var ses = sharedData.get('sessao');
			sessaoService.hasUpdate(ses._id)
			.success(function(data){
				if(data === ses.hash){
					sessao = ses;
					configCategorias(sessao.categorias);
				}else{
					getSessao(nomeSessao);
				}
			})
			.error(function(data){
				console.log("Erro: " + data);
			});
		}else{
			getSessao(nomeSessao);
		}
	}

	//Mostra 7, porque inicia em 0.
	var maxShow = 6;
	$scope.showingPr = [];

	var configCategorias = function(categorias){
		var index = $rootScope.indexCatPr || 0;

		if(!categorias[index])
			index = 0;

		var categoria = categorias[index];

		categoriasService.getCategoria(categoria._id).success(function(data){
			$scope.currentCategoria = data;

			configProdutos(categoria, function(){
				if(!$rootScope.useIndexPr){
					index++;
					$rootScope.indexCatPr = index;
				}
			});
		});
	}

	var configProdutos = function(categoria, callback){

		var produtos = [];
		produtosService.getProdutos(categoria._id).success(function(data){

			produtos = data;

			produtos = defineValor.definir(produtos);

			var restartedIndex = false;
			var useIndex = $rootScope.useIndexPr || 0;
			for(var it = 0; it <= maxShow; it++){

				if(!produtos[useIndex]){
					useIndex = 0;
					restartedIndex = true;
				}

				$scope.showingPr.push(produtos[useIndex]);
				useIndex++;
			}

			if(!restartedIndex){
				if(useIndex <= produtos.length){
					$rootScope.useIndexPr = useIndex;
				}
			}else{
				delete $rootScope.useIndexPr;
			}

			configTimer(categoria.tempo);
			return callback();
		});
	}

	var configTimer = function(tempo){
		console.log("Tempo: " + tempo);
		$timeout(function(){
			$location.path('/baners');
		}, tempo * 1000);
	}

	configSes(sessao);
})

.controller("banersController", function($http, $scope, $rootScope, $location, $timeout, $routeParams, sessaoService, sharedData, produtosService, defineValor){

	//var sessao = sessao.data;

	var getSessao = function(nomeSessao){
		sessaoService.getSessao(nomeSessao).success(function(data){
			sessao = data;
			sharedData.set('sessao', sessao);
			getProdutos(sessao);
		});
	}

	var getProdutos = function(sessao){
		produtosService.getProdutosBaner(sessao._id).success(function(data){
			sharedData.set('produtos', data);
			configProdutos(data);
    });
	}

	var configProdutos = function(data){
		var produtos = $scope.produtos = data;

			produtos = defineValor.definir(produtos);

			var maxShow = 6;
		var index = $rootScope.indexPr || 0;
		$scope.showing = [];

			/*
		Pega maxShow produtos no array de produtos e guarda o index da ultima posição utilizada no rootScope.
		Na próxima iteração irá continuar a partir do index armazenado em rootScope e pegar mais maxShow elementos.
		Quando o index 'estourar' a lista de elementos, então reiniciar o index para buscar a partir do primeiro elemento.

		OBS: Quando o número de elemento do array de produtos é menor que o valor em maxShow
		então acontece de os primeiros produtos se repetirem até atingir o valor de maxShow.
		Porém, isso gerou um erro no ng-repeat por não aceitar elementos repetidos por padrão.
		Para contornar esta situação, foi adicionado 'track by $index' no ng-repeat.
		Solução documentada aqui: https://docs.angularjs.org/error/ngRepeat/dupes
			*/
			var restartIndex = 0;
			var maxS = index + maxShow-1;

			for(index; index <= maxS; index++){
				if(produtos[index]){
					$scope.showing.push(produtos[index]);
					$rootScope.indexPr = index;
				}else{
					if(produtos[restartIndex]){
						$scope.showing.push(produtos[restartIndex]);
						$rootScope.indexPr = restartIndex;
					}else{
						restartIndex = 0;
						$scope.showing.push(produtos[restartIndex]);
						$rootScope.indexPr = restartIndex;
					}
					restartIndex++;
				}
			}
	}

    var loadProdutos = function(){

			var nomeSessao = null;
			//Será um usado no futuro, talvez próximo.
			if($routeParams.sessao){
				var nomeSessao = $routeParams.sessao;
			}

			if(sharedData.has('sessao')){
				var ses = sharedData.get('sessao');
				sessaoService.hasUpdate(ses._id)
				.success(function(data){
					if(data === ses.hash){
						sessao = ses;
						if(sharedData.has('produtos')){
							configProdutos(sharedData.get('produtos'));
						}else{
							getProdutos(sessao);
						}
					}else{
						getSessao(nomeSessao);
					}
				})
				.error(function(data){
					console.log("Erro: " + data);
				});
			}else{
				getSessao(nomeSessao);
			}
	}

    loadProdutos();

	$timeout(function(){
		$location.path('/tabela');
	}, 6000);
});
