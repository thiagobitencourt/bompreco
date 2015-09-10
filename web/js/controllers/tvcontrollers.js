angular.module("bpTv")

.controller("tabelaController", 
function($scope, $rootScope, $timeout, $location, sessao, sessaoService, produtosService, categoriasService){

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

	//Mostra 6, porque inicia em 0.
	var maxShow = 5;
	$scope.showingPr = [];

	var configCategorias = function(categorias){
		// console.log(categorias);
		var index = $rootScope.indexCatPr || 0;

		if(!categorias[index])
			index = 0;

		var categoria = categorias[index];

		categoriasService.getCategoria(categoria._id).success(function(data){
			$scope.currentCategoria = data;
			
			configProdutos(categoria, function(){
				if(!$rootScope.useIndexPr){
					console.log("Incrementando index");
					index++;
					$rootScope.indexCatPr = index;
				}
				
				console.log("Index scope: " + $rootScope.indexCatPr);
			});
		});
	}

	var configProdutos = function(categoria, callback){

		var produtos = [];
		produtosService.getProdutos(categoria._id).success(function(data){

			produtos = data;

			defineValor(produtos);
			console.log(produtos);

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
					console.log("há mais produtos a serem mostrados");
					$rootScope.useIndexPr = useIndex;
				}
			}else{
				console.log("Todos os produtos foram mostrados");
				delete $rootScope.useIndexPr;
				console.log($rootScope.useIndexPr);
			}

			configTimer(categoria.tempo);
			return callback();
		});
	}

	var configTimer = function(tempo){
		$timeout(function(){
			console.log("time out for categoria " + $scope.currentCategoria._id);
			$location.path('/baners');
		}, tempo * 500);
	}

	configSes(sessao);

	var defineValor = function(produtos){
	    var weekDay = new Array(7);
	    weekDay[1] = "segunda-feira";
	    weekDay[2] = "terça-feira"; 
	    weekDay[3] = "quarta-feira";
		weekDay[4] = "quinta-feira";
		weekDay[5] = "sexta-feira";
		weekDay[6] = "sábado";
		weekDay[7] = "domingo";

    	var hoje = weekDay[new Date().getDay()];

    	produtos.forEach(function(produto){
	    	if(produto.valorEspecial && produto.valorEspecial.length > 0){
	    		
	    		var diasEspeciais = produto.valorEspecial;

	    		diasEspeciais.forEach(function(iterator){
	    			if(iterator.dia == hoje){

	    				produto.valorHoje = iterator.valor;
	    				return;

	    			}else if(!produto.valorHoje){
	    				produto.valorHoje = produto.valorPadrao;
	    			}
	    		});
	    	}else{
	    		produto.valorHoje = produto.valorPadrao;
	    	}
    	});
    }
})

.controller("banersController", function($scope, $rootScope, $location, $timeout, sessao, produtosService){

	var maxShow = 4;
	var index = $rootScope.indexPr || 0;
	var restartIndex = 0;
	$scope.showing = [];

	console.log("Index inicial: " + index);

	var sessoes = sessao.data;

    var defineValor = function(produtos){
	    var weekDay = new Array(7);
	    weekDay[1] = "segunda-feira";
	    weekDay[2] = "terça-feira"; 
	    weekDay[3] = "quarta-feira";
		weekDay[4] = "quinta-feira";
		weekDay[5] = "sexta-feira";
		weekDay[6] = "sábado";
		weekDay[7] = "domingo";

    	var hoje = weekDay[new Date().getDay()];

    	produtos.forEach(function(produto){
	    	if(produto.valorEspecial && produto.valorEspecial.length > 0){
	    		
	    		var diasEspeciais = produto.valorEspecial;

	    		diasEspeciais.forEach(function(iterator){
	    			if(iterator.dia == hoje){

	    				produto.valorHoje = iterator.valor;
	    				return;

	    			}else if(!produto.valorHoje){
	    				produto.valorHoje = produto.valorPadrao;
	    			}
	    		});
	    	}else{
	    		produto.valorHoje = produto.valorPadrao;
	    	}
    	});
    }

    var loadProdutos = function(sessao){
		produtosService.getProdutosBaner(sessao._id).success(function(data){
			var produtos = $scope.produtos = data;

    		defineValor(produtos);
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
    		var maxS = index + maxShow-1;
    		for(index; index <= maxS; index++){

    			if(produtos[index]){
    				$scope.showing.push(produtos[index]);
    				$rootScope.indexPr = index;
    			}else{
    				$scope.showing.push(produtos[restartIndex]);
    				$rootScope.indexPr = restartIndex;
    				restartIndex++;
    			}
    		}
		});
    }

    loadProdutos(sessoes);

	$timeout(function(){
		console.log("time out for banners");
		$location.path('/tabela');
	}, 6000);
});