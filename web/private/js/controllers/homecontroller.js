angular.module('bomprecotv').controller('homeController', function($scope, $cookies, $http){
	var home = this;

    var cookiesUser = $cookies.get('user');
    // console.log(cookiesUser);
    if(cookiesUser){
		home.user = {};
		//TODO: mudar para name e mostra o nome de quem esta logado
		home.user.nome = angular.fromJson(cookiesUser).username;
    }else{
        home.user = {};
    	home.user.nome = "Desconhecido";
    }

    $scope.sair = function(){

    	$cookies.remove('user');
    	// $http.post("http://localhost:8000/logout").success(function(data){
    	// 	console.log("saindo");
    	// });
    }
});