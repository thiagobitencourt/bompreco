angular.module('bomprecotv').controller('produtosController', function(Produtos, categoriasService){
	var proCtrl = this;

	var produtos = proCtrl.produtos = Produtos.data;
	var categorias = proCtrl.categorias = [];

	// console.log(produtos);
});