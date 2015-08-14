var app = angular.module("bomprecotv");

app.factory("sessaoService", function($http, config){
	var _sessao = '/sessoes';

	var _getSessoes = function(){
		return $http.get(config.baseWebUrl + _sessao);
	};

	var _postSessao = function(sessao){
		return $http.post(config.baseWebUrl + _sessao, sessao);
	};

	var _updateSessao = function(sessao){
		return $http.put(config.baseWebUrl + _sessao + '/' + sessao._id, sessao);	
	}

	var _deleteSessao = function(sessaoId){
		return $http.put(config.baseWebUrl + _sessao + '/' + sessaoId);		
	}

	return {
		getSessoes: _getSessoes,
		newSessao: _postSessao,
		updateSessao: _updateSessao,
		deleteSessao: _deleteSessao
	};
});

app.factory("categoriasService", function($http, config){

	var _categoria = '/categorias';

	var _getCategorias = function(){
		return $http.get(config.baseWebUrl + _categoria);
	};

	var _postCategoria = function(categoria){
		return $http.post(config.baseWebUrl + _categoria, categoria);
	};

	var _updateCategoria = function(categoria){
		return $http.put(config.baseWebUrl + _categoria + '/' + categoria._id, categoria);	
	}

	var _deleteCategoria = function(categoriaId){
		return $http.delete(config.baseWebUrl + _categoria + '/' + categoriaId);		
	}

	return {
		getCategorias: _getCategorias,
		postCategoria: _postCategoria,
		updateCategoria: _updateCategoria,
		deleteCategoria: _deleteCategoria
	};
});

app.factory("produtosService", function($http, config){

	var _produtos = '/produtos';

	var _getProdutos = function(){
		return $http.get(config.baseWebUrl + _produtos);
	};

	var _postProduto = function(produto){
		return $http.post(config.baseWebUrl + _produtos, produto);
	};

	var _updateProduto = function(produto){
		return $http.put(config.baseWebUrl + _produtos + '/' + produto._id, produto);	
	};

	var _deleteProduto = function(produtoId){
		return $http.put(config.baseWebUrl + _produtos + '/' + produtoId);		
	};

	var _getByCategoria = function(categoriaId){
		return $http.get(config.baseWebUrl + _produtos + '/categoria/' + categoriaId);			
	};

	var _getLengthByCategoria = function(categoriaId){
		return $http.get(config.baseWebUrl + _produtos + '/length/' + categoriaId);			
	};

	return {
		getProdutos: _getProdutos,
		postProduto: _postProduto,
		updateProduto: _updateProduto,
		deleteProduto: _deleteProduto,
		getByCategoriaId: _getByCategoria,
		getLengthByCategoria : _getLengthByCategoria
	};
});