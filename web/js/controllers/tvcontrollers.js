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
			console.log("time out for categoria " + cat._id);
			$location.path('/baners');
		}, cat.tempo * 500);
	}

	if($rootScope.categorias && $rootScope.categorias.length > 0){
		
		console.log($rootScope.categorias);
		showFunction($rootScope.categorias);

	}else{

		delete $rootScope.categorias;
			/*
			Se houver a variavel rootScope.categorias, significa que não é a primeira execução. 
			Então recarrega a sessão para pegar alguma possível atualização.
			*/
			sessaoService.getSessao(sessoes._id).success(function(data){
				sessoes = data;
			});

		
		$rootScope.categorias = sessoes.categorias;
		showFunction($rootScope.categorias);
	}
})

.controller("banersController", function($scope, $location, $timeout, sessao, produtosService){

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
			$scope.produtos = data;
    		defineValor($scope.produtos);
		});
    }

    loadProdutos(sessoes);

	$timeout(function(){
		console.log("time out for banners");
		$location.path('/tabela');
	}, 5000);
});