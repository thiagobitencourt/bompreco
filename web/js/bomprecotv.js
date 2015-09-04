angular.module('bomprecotv', ['ngRoute']).config(function($routeProvider) {
$routeProvider
  .when('/sessoes', {
    controller: 'sessaoController',
    templateUrl:'view/sessoes.html',
    resolve: {
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
})

.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);