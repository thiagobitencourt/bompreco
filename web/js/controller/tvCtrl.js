angular.module("bompreco").controller('tvCtrl', function ($scope, $location, produtos) {
    
    $scope.tv = "Hello From TVCtrl";
    $scope.produtos = produtos.data;
    
    var defineValor = function(produtos){
	    var weekDay = new Array(7);
	    weekDay[1] = "segunda-feira";
	    weekDay[2] = "terça-feira"; 
	    weekDay[3] = "quarta-feira";
		weekDay[4] = "quinta-feira";
		weekDay[5] = "sexta-feira";
		weekDay[6] = "sábado";
		weekDay[7] = "domingo";

    	var d = weekDay[new Date().getDay()];

    	produtos.forEach(function(produto){
	    	if(produto.valorEspecial.length > 0){
	    		var dias = produto.valorEspecial;

	    		dias.forEach(function(dia){
	    			if(dia[d]){
	    				produto.valorHoje = dia[d];
	    			}else if(!produto.valorHoje){
	    				produto.valorHoje = produto.valorPadrao;
	    			}
	    		});
	    	}else{
	    		produto.valorHoje = produto.valorPadrao;
	    	}
    	});
    }

    defineValor($scope.produtos);

})
