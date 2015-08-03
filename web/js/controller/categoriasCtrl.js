angular.module("bompreco").controller('categoriasCtrl', function ($scope, $location, categorias) {

	$scope.categorias = categorias.data;

});
