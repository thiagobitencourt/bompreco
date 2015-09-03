angular.module("bpTv", ['ngRoute', 'ds.clock'])
.config(function($routeProvider) {
	
	console.log("Load Controllers");

	$routeProvider
	.when('/tabela', {
	    controller: 'tabelaController',
	    templateUrl:'tvView/tabela.html',
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
		templateUrl: 'tvView/baners.html',
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
	baseWebUrl: "http://localhost:8000/tv",
	sessaoUrl: "/sessao"
})

.factory("sessaoService", function($http, config){
	var _sessao = config.sessaoUrl;

	var _getPadrao = function(){
		return $http.get(config.baseWebUrl + _sessao);
	};

	var _getSessao = function(sessaoNome){
		return $http.get(config.baseWebUrl + _sessao + '/' + sessaoNome);		
	}

	return {
		getPadrao: _getPadrao,
		getSessao: _getSessao
	};
})

.factory("produtosService", function($http, config){
	var _produtos = config.sessaoUrl + '/produtos';

	var _getProdutos = function(categoriaId){
		return $http.get("http://localhost:8000/api/produtos/categoria/" + categoriaId);
		// return $http.get(config.baseWebUrl + _produtos + '/' + categoriaId);		
	};

	//Busca os produtos individuais, para apresentar nos baners.
	var _getProdutosBaner = function(sessaoId){
		return $http.get("http://localhost:8000/api/produtos/sessao/" + sessaoId);
	}


	return {
		getProdutos: _getProdutos,
		getProdutosBaner: _getProdutosBaner
	};
})

.factory("categoriasService", function($http, config){
	var _categorias = config.sessaoUrl + '/categorias';

	var _getCategorias = function(sessaoId){
		return $http.get("http://localhost:8000/api/categorias");
		// return $http.get(config.baseWebUrl + _categorias + '/' + sessaoId);		
	};

	var _getCategoria = function(categoriaId){
		return $http.get("http://localhost:8000/api/categorias/" + categoriaId);
		// return $http.get(config.baseWebUrl + _categorias + '/id_cat/' + categoriaId);
	}

	return {
		getCategorias: _getCategorias,
		getCategoria: _getCategoria
	};
});