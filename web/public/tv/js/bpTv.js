angular.module("bpTv", ['ngRoute', 'tb-sharedata'])
.config(function($routeProvider) {
	$routeProvider
	.when('/tabela', {
	    controller: 'tabelaController',
	    templateUrl:'view/tabela.html'
	})
	.when('/baners', {
		controller: 'banersController',
		templateUrl: 'view/baners.html'
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
.constant('banersConfig', {
	maxShow: 6,
	showTime: 10000
})
.constant('tabelaConfig', {
	maxShow: 6 //mostra sempre 1 a mais.
})
.factory("sessaoService", function($http, config){
	var _sessao = config.sessaoUrl;

	var _getPadrao = function(){
		return $http.get(config.baseWebTvUrl + _sessao);
	};
	var _getSessao = function(sessaoNome){
		if(sessaoNome)
			return $http.get(config.baseWebTvUrl + _sessao + '/' + sessaoNome);
		else
			return _getPadrao();
	}
	var _hasUpdate = function(sessaoId) {
		return $http.get(config.baseWebTvUrl + _sessao + '/hash/' + sessaoId);
	}

	return {
		getPadrao: _getPadrao,
		getSessao: _getSessao,
		hasUpdate: _hasUpdate
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
					if(iterator.dia == hoje)
    				produto.valorHoje = iterator.valor;
    		});
				produto.valorHoje = produto.valorHoje || produto.valorPadrao;
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
