angular.module("bpTv")
.controller("banersController",
function($scope, $timeout, $location, $routeParams, sharedData, sessaoService, defineValor, banersConfig){

  var timer = banersConfig.showTime;
  var sessao = {};
  var initConfig = function(){
    if(sharedData.has('sessao')){
      sessao = sharedData.get('sessao');
      configProdutos(sessao.produtos);
    }else{
      var nomeSessao = $routeParams.sessao;
      sessaoService.getSessao(nomeSessao)
      .then(
      function(result){
        sessao = result.data;
        configProdutos(sessao.produtos);
      },
      function(error){
        //TODO: Show Modal Error.
        console.log('Erro ao carregar sessão ' + nomeSessao || 'Padrão');
      });
    }
  };

  var configProdutos = function(data){

    //If no produtos are available to be shown, just show the BomPreçoTV logo for 2 seconds each time
    if(data && data.length === 0){
      $scope.prAvailable = false;
      timer = 2000;
      return;
    }

    $scope.prAvailable = true;
    var produtos = $scope.produtos = data;
    produtos = defineValor.definir(produtos);

    var indexProduto = 'indexProdutoBaner';
    var maxShow = banersConfig.maxShow;
    var index = sharedData.get(indexProduto) || 0;
    $scope.showing = [];

    /*
      Pega maxShow produtos no array de produtos e guarda o index da ultima posição utilizada no rootScope.
      Na próxima iteração irá continuar a partir do index armazenado em rootScope e pegar mais maxShow elementos.
      Quando o index 'estourar' a lista de elementos, então reiniciar o index para buscar a partir do primeiro elemento.
    */
    var restartIndex = 0;
    var maxS = index + maxShow-1;
    for(index; index <= maxS; index++){
      if(produtos[index]){
        $scope.showing.push(produtos[index]);
        sharedData.set(indexProduto, index);
      }else{
        if(produtos[restartIndex]){
          $scope.showing.push(produtos[restartIndex]);
        }else{
          restartIndex = 0;
          $scope.showing.push(produtos[restartIndex]);
        }
        sharedData.set(indexProduto, restartIndex);
        restartIndex++;
      }
    }
  };
  initConfig();
  $timeout(function(){
    $location.path('/tabela');
  }, timer);
});
