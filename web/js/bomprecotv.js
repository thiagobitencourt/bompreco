/*
Formatação de moeda para Real Brasileiro.
Filtro desenvolvido por Igor Costa, acessivel em:
  https://github.com/igorcosta/ng-filters-br/blob/master/src/brasil/filters/realbrasileiro.js
*/

function formatReal( int ){
  var tmp = int+'';
  var res = tmp.replace('.','');
  tmp = res.replace(',','');
  var neg = false;
  if(tmp.indexOf('-') === 0){
    neg = true;
    tmp = tmp.replace('-','');
  }
  if(tmp.length === 1) {
    tmp = '0'+tmp;
  }
  tmp = tmp.replace(/([0-9]{2})$/g, ',$1');
  if( tmp.length > 6){
    tmp = tmp.replace(/([0-9]{3}),([0-9]{2}$)/g, '.$1,$2');
  }
  if( tmp.length > 9){
    tmp = tmp.replace(/([0-9]{3}).([0-9]{3}),([0-9]{2}$)/g,'.$1.$2,$3');
  }
  if( tmp.length > 12){
    tmp = tmp.replace(/([0-9]{3}).([0-9]{3}).([0-9]{3}),([0-9]{2}$)/g,'.$1.$2.$3,$4');
  }
  if(tmp.indexOf('.') === 0){
    tmp = tmp.replace('.','');
  }
  if(tmp.indexOf(',') === 0){
    tmp = tmp.replace(',','0,');
  }
  return (neg ? '-'+tmp : tmp);
}

angular.module('bomprecotv', ['ngRoute', 'money-mask']).config(function($routeProvider) {
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
}])

.filter('realbrasileiro', function() {
  return function(input) {
    return 'R$ ' + formatReal(input);
  };
});