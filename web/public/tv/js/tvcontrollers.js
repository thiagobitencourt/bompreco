angular.module("bpTv")

.controller("tabelaController", 
function($scope, $rootScope, $timeout, $location, sessao, sessaoService, produtosService, categoriasService, defineValor){

	var sessao = sessao.data;

	var configSes = function(sessao){

		//Será um usado no futuro, talvez próximo.
		// if($routeParams.sessao)
		// 	return sessaoService.getSessao($routeParams.sessao);
		// else
		// 	return sessaoService.getPadrao();

		configCategorias(sessao.categorias);

		// sessaoService.getSessao(sessao._id).success(function(data){
		// 	sessao = data;
		// 	configCategorias(sessao.categorias);
		// });
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

.controller("banersController", function($http, $scope, $rootScope, $location, $timeout, sessao, produtosService, defineValor){

	var sessoes = sessao.data;

    var loadProdutos = function(sessao){
		produtosService.getProdutosBaner(sessao._id).success(function(data){
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
		});
    }

    loadProdutos(sessoes);

	$timeout(function(){
		$location.path('/tabela');
	}, 6000);
});