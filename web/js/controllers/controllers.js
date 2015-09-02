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
			$location.path('/baners');
		}, cat.tempo * 1000);
	}

	if($rootScope.categorias && $rootScope.categorias.length > 0){
		
		showFunction($rootScope.categorias);

	}else{

		if($rootScope.categorias){
			/*
			Se houver a variavel rootScope.categorias, significa que não é a primeira execução. 
			Então recarrega a sessão para pegar alguma possível atualização.
			*/
			sessaoService.getSessao(sessoes._id).success(function(data){
				sessoes = data;
			});
		}
		
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

    	var d = weekDay[new Date().getDay()];

    	produtos.forEach(function(produto){
	    	if(produto.valorEspecial && produto.valorEspecial.length > 0){
	    		var dias = produto.valorEspecial;

	    		dias.forEach(function(dia){
	    			if(dia[d]){
	    				produto.valorHoje = dia[d];
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
		$location.path('/tabela');
	}, 5000);
});