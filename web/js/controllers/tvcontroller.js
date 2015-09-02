angular.module('bomprecotv').controller('tvController', function(Sessoes, categoriasService, produtosService, config){
	var tvCtrl = this;

	var sessoes = tvCtrl.sessoes = Sessoes.data;
	var categorias = tvCtrl.categorias = [];
	var produtos = tvCtrl.produtos = [];

	tvCtrl.url = config.baseWebUrl;
	tvCtrl.sessoesFiltered = sessoes.filter(function(element){ return !(element.categorias.length == 0 && element.produtos.length == 0);});
});