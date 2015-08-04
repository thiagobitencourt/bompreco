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
	$routeProvider.when("/produtos", {
		templateUrl: "templates/categorias.html",
		controller: "categoriasCtrl",
		resolve: {
			categorias: function($http){
				return $http.get("http://localhost:8000/categorias");
			}
		}
	});
	$routeProvider.when("/testes", {
		templateUrl: "templates/testes.html"
	});
	$routeProvider.when("/login", {
		template: "<h1>LoginPage</h1>"
	});

	$routeProvider.otherwise({redirectTo: "/"});
});