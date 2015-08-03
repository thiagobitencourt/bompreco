angular.module("bompreco", ["ngRoute", "ngCookies"]);

angular.module("bompreco").config(function($routeProvider, $locationProvider) {

	$routeProvider.when("/tv", {
		templateUrl: "templates/tv.html",
		controller: "tvCtrl",
		resolve: {
			produtos: function($http){
				return $http.get("http://localhost:8000/produtos");
			}
		}
	});
	$routeProvider.when("/categorias", {
		templateUrl: "templates/categorias.html",
		controller: "categoriasCtrl",
		resolve: {
			categorias: function($http){
				return $http.get("http://localhost:8000/categorias");
			}
		}
	});
	$routeProvider.when("/produtos", {
		templateUrl: "templates/produtos.html",
		controller: "produtosCtrl",
		resolve: {
			produtos: function($http){
				return $http.get("http://localhost:8000/produtos");
			}
		}
	});
	$routeProvider.otherwise({redirectTo: "/"});
});