angular.module('bomprecotv', ['ngRoute']).config(function($routeProvider) {
$routeProvider
  .when('/sessoes', {
    controller: 'sessaoController',
    templateUrl:'view/sessoes.html',
    resolve: {
      Sessoes: function (sessaoService) {
        return sessaoService.getSessoes();
      },
      Categorias: function (categoriasService) {
        return categoriasService.getCategorias();
      }
    }
  })
  .when('/categorias', {
    controller:'categoriasController as catCtrl',
    templateUrl:'view/categorias.html',
    resolve: {
    	Categorias: function (categoriasService) {
        	return categoriasService.getCategorias();
      	}
    }
  })
  .when('/produtos', {
    controller:'produtosController as proCtrl',
    templateUrl:'view/produtos.html',
    resolve: {
    	Produtos: function(produtosService){
    		return produtosService.getProdutos();
    	}
    }
  })
  .when('/tv', {
    controller:'tvController as tvCtrl',
    templateUrl:'view/tv.html',
    resolve: {
      Sessoes: function(sessaoService) {
        return sessaoService.getSessoes();
      }
    }
  })
  .when('/404', {
    // controller:'NewProjectController as editProject',
    templateUrl:'view/404.html'
  }).
  when('/', {
    redirectTo:'/sessoes'
  })
  .otherwise({
    redirectTo:'/404'
  });
}).value("config", {
	baseWebUrl: "http://localhost:8000/api"
});