angular.module("bompreco").controller('sessaoTabsController', function ($scope, $location, $http) {
	/*
	$scope.sessoes = [{nome: "Sessao1", descricao: "Conteudo da sessao 1"}, {nome: "Sessao2", descricao: "Conteudo da sessao 2"}, {nome: "Sessao3", descricao: "Conteudo da sessao 3"},
	{nome: "Sessao4", descricao: "Conteudo da sessao 1"}, {nome: "Sessao5", descricao: "Conteudo da sessao 2"}, {nome: "Sessao6", descricao: "Conteudo da sessao 3"}, {nome: "Sessao7", descricao: "Conteudo da sessao 1"}, {nome: "Sessao8", descricao: "Conteudo da sessao 1"},
	{nome: "Sessao1", descricao: "Conteudo da sessao 1"}, {nome: "Sessao2", descricao: "Conteudo da sessao 2"}, {nome: "Sessao3", descricao: "Conteudo da sessao 3"},
	{nome: "Sessao4", descricao: "Conteudo da sessao 1"}, {nome: "Sessao5", descricao: "Conteudo da sessao 2"}, {nome: "Sessao6", descricao: "Conteudo da sessao 3"}, {nome: "Sessao7", descricao: "Conteudo da sessao 1"}, {nome: "Sessao8", descricao: "Conteudo da sessao 1"}];
	*/

	var othersSes = [];
	var lastTab;
	var maxTabs = 8;
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
			sessoes[1].ativa = true
			$scope.openSessao = sessoes[1];
		}
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

		$scope.sessoes.forEach(function(ses){
			ses.ativa = false;
		});

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
		console.log("Cadastrar sessão " + novaSessao);
		novaSessao.ativa = true;
		
		$http.post('http://localhost:8000/sessao', novaSessao).success(function(data, status){

			loadSessoes();

		}).error(function(data, status){
			console.log(data);
		});
		// console.log("Neste momento será feito um GET das novas sessões e ai irá funcionar");
		// $scope.sessoes.push(novaSessao);
		
		openSes($scope.sessoes);
	};

	var loadSessoes = function(){
		console.log("Carregando sessões!");
		$http.get('http://localhost:8000/sessao').success(function(data, status){
			openSes(data);
		}).error(function(data, status){
			console.log(data);
		});
	}

	loadSessoes();

});