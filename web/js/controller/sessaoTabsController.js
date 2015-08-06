angular.module("bompreco").controller('sessaoTabsController', function ($scope, $location, $http) {

	var othersSes = [];
	var lastTab;
	var maxTabs = 6;
	var currTabIndex = maxTabs;

	var openSes = function(sessoes){

		if(sessoes.length > maxTabs){
			$scope.limit = maxTabs;
			lastTab = sessoes.length;
			console.log("Ultima: " + lastTab);
			
			othersSes = sessoes;
			sessoes = [];

			for(var i = 0; i < maxTabs; i++){
				sessoes.push(othersSes.shift());
			}

			$scope.hasMoreTabs = true;

			console.log(JSON.stringify(othersSes));
			console.log(JSON.stringify(sessoes));

		}else if(sessoes.length == 0){
			$scope.showCadastrarSessaoForm = true;
			return;
		}
		
		$scope.sessoes = sessoes;

		var hasAtiva = false;
		sessoes.forEach(function(ses){
			if(ses.ativa){
				$scope.openSessao = ses;
				hasAtiva = ses.ativa;
			}
		});

		if(!hasAtiva){
			console.log("Não ha uma ativa");
			sessoes[0].ativa = true
			$scope.openSessao = sessoes[0];
		}
	}

	$scope.closeAll = function(){
		$scope.sessoes.forEach(function(ses){
			ses.ativa = false;
		});
	}

	$scope.netxTab = function(){
		currTabIndex++;
		console.log(currTabIndex);

		var tmpSes = $scope.sessoes.shift();
		$scope.sessoes.push(othersSes.shift());
		othersSes.push(tmpSes);

		$scope.hasPreviousSession = true;

		if(currTabIndex == lastTab){
			$scope.hasMoreTabs = false;
			return;
		}
		// console.log(JSON.stringify(othersSes));
		// console.log(JSON.stringify($scope.sessoes));
	}

	$scope.prevTab = function(){
		currTabIndex--;
		console.log(currTabIndex);

		$scope.hasMoreTabs = true;

		var tmpSes = othersSes.pop();
		othersSes.unshift($scope.sessoes.pop());
		$scope.sessoes.unshift(tmpSes);

		if(currTabIndex == maxTabs){
			$scope.hasPreviousSession = false;
			return;
		}
	}

	$scope.open = function(sessao){

		$scope.closeAll();

		if(!sessao){
			$scope.showCadastrarSessaoForm = true;
			return;
		}
		$scope.showCadastrarSessaoForm = false;
		
		// console.log("Open the tab with ID " + tabId);
		sessao.ativa = true;
		$scope.openSessao = sessao;
	};

	$scope.salvarSessao = function(novaSessao){
		$scope.showCadastrarSessaoForm = false;
		if(!novaSessao){return;}

		novaSessao.padrao = false;
		console.log("Cadastrar sessão " + JSON.stringify(novaSessao));
		// novaSessao.ativa = true;
		
		$http.post('http://localhost:8000/sessao', novaSessao).success(function(data, status){
			$scope.closeAll();
			console.log("Voltou");
			loadSessoes();
			openSes($scope.sessoes);
		}).error(function(data, status){
			console.log(data);
		});	
	};

	$scope.openProdutos = function(categoria){
		$scope.anySelected = true;
		categoria.prShowing = true;
		console.log(categoria);

		$http.get('http://localhost:8000/produtos/categoria/' + categoria._id).success(function(data, status){
			$scope.produtos = data;
		}).error(function(data, status){
			console.log(data);
		});
	}

	$scope.closeProdutos = function(categoria){
		delete $scope.produtos;
		$scope.anySelected = false;
		categoria.prShowing = false;
	}

	var loadSessoes = function(){
		console.log("Carregando sessões!");
		$http.get('http://localhost:8000/sessao').success(function(data, status){
			openSes(data);

			$http.get('http://localhost:8000/categorias').success(function(data, status){
				$scope.categorias = data;
				$scope.categorias[0].tempo = 10;
			}).error(function(data, status){
				console.log(data);
			});

		}).error(function(data, status){
			console.log(data);
		});
	}

	loadSessoes();
});