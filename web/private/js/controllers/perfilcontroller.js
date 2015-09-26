angular.module('bomprecotv').controller('perfilController', function($scope, $rootScope, $http){

	$scope.user = angular.copy($rootScope.user);
	$scope.editting = false;

	$scope.errMessage;

	$scope.edit = function(){
		$scope.editting = true;
		console.log("Editando");
	}

	$scope.save = function(user){
		if(!user){
			$scope.editting = false;		
			return;
		}

		if(!user.nome){
			$scope.errMessage = "Campo Nome é obrigatório";
			return;
		}

		if(!user.username){
			$scope.errMessage = "Campo Usuário é obrigatório";
			return;
		}

		if(user.password != user.repPassword){
			$scope.errMessage = "Repita a senha corretamente";
			return;
		}

		$http.put(window.location.origin + '/api/usuarios/' + user._id, user).success(function(data, status){
			
			$rootScope.$broadcast('user', data);
			
			$scope.user = data;
			
			$scope.errMessage = null;
			$scope.editting = false;			
		}).error(function(data){
			console.log(data.message);
			$scope.errMessage = data.message;
		});
	}

});