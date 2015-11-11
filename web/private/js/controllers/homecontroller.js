angular.module('bomprecotv').controller('homeController', function($scope, $modal, $http, $location, $rootScope){
  $http.get(window.location.origin + '/session').success(function(data){
      $scope.user = $rootScope.user = data;
  });
	// listen for the event in the relevant $scope
	$rootScope.$on('user', function (event, data) {
  		$scope.user = $rootScope.user = data;
	});
  $scope.openTv = function(){
  	$http.get(window.location.origin + '/tv/sessao').success(function(data){
    	var openModal = function(){
    		var modalInstance = $modal.open({
          animation: false,
          templateUrl: 'confirmModal.html',
          controller: 'ModalInstanceCtrl',
          resolve: {
            titulo: function () {
              return "Sessão " + data.nome +" não configurada. Deseja Configurá-la?";
            },
            ok: function() {
            	return "Configurar";
            },
            cancel: function(){
            	return "Cancelar";
            }
          }
        });

        modalInstance.result.then(function (selectedItem) {
        	$location.path('/sessoes');
        }, function () {
        	//Modal dismissed. Cancel
        });
    	}

    	if(data.categorias.length == 0 || data.produtos.length == 0){
    		openModal();
    	}else{
    		window.open(window.location.origin + '/tv','_blank');
    	}
  	});
  };
});
