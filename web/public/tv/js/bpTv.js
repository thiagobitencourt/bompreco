angular.module("bpTv", ['ngRoute', 'ds.clock'])
.config(function($routeProvider) {

	$routeProvider
	.when('/tabela', {
	    controller: 'tabelaController',
	    templateUrl:'view/tabela.html',
	    resolve: 
			{
				sessao: function($routeParams, sessaoService){
					if($routeParams.sessao)
						return sessaoService.getSessao($routeParams.sessao);
					else
						return sessaoService.getPadrao();
				}
			}
	})
	.when('/baners', {
		controller: 'banersController',
		templateUrl: 'view/baners.html',
		resolve: 
			{
				sessao: function($routeParams, sessaoService){
					if($routeParams.sessao)
						return sessaoService.getSessao($routeParams.sessao);
					else
						return sessaoService.getPadrao();
				}
			}
	})
	.when('/:sessao', {
		redirectTo: '/tabela'
	})
	.when('/', {
		redirectTo: '/tabela'
	});
})

.value("config", {
	baseWebTvUrl: window.location.origin + '/tv',
	sessaoUrl: "/sessao"
})

.factory("sessaoService", function($http, config){
	var _sessao = config.sessaoUrl;

	var _getPadrao = function(){
		return $http.get(config.baseWebTvUrl + _sessao);
	};

	var _getSessao = function(sessaoNome){
		return $http.get(config.baseWebTvUrl + _sessao + '/' + sessaoNome);		
	}

	return {
		getPadrao: _getPadrao,
		getSessao: _getSessao
	};
})

.factory("produtosService", function($http, config){
	var _produtos = '/produtos';

	var _getProdutos = function(categoriaId){
		return $http.get(config.baseWebTvUrl + _produtos + '/categoria/' + categoriaId);		
	};

	//Busca os produtos individuais, para apresentar nos baners.
	var _getProdutosBaner = function(sessaoId){
		return $http.get(config.baseWebTvUrl + _produtos  + '/sessao/' + sessaoId);
	}

	return {
		getProdutos: _getProdutos,
		getProdutosBaner: _getProdutosBaner
	};
})

.factory("categoriasService", function($http, config){
	var _categorias = '/categorias';

	var _getCategorias = function(sessaoId){
		return $http.get(config.baseWebTvUrl + _categorias);
	};

	var _getCategoria = function(categoriaId){
		return $http.get(config.baseWebTvUrl + _categorias + "/" + categoriaId);
	}

	return {
		getCategorias: _getCategorias,
		getCategoria: _getCategoria
	};
})

.factory('defineValor', function(){

	var _func = function(produtos){

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

    	return produtos;
	}

	return {
		definir: _func
	};
});