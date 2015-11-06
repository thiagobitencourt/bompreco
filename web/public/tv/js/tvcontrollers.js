angular.module("bpTv")

.controller("tabelaController",
function($scope, $timeout, $location, $routeParams, sharedData, sessaoService, defineValor, tabelaConfig){

  $scope.showingPr = [];
  var maxShow = tabelaConfig.maxShow;
  var sessao = null;
  var loadSessao = function(sessaoNome){
    sessaoService.getSessao(sessaoNome)
    .then(
    function(result){
      sessao = result.data;
			sharedData.set('sessao', sessao);
      configCategorias(sessao.categorias);
    },
    function(error){
      //TODO: Show Modal Error.
      console.log('Erro ao carregar sessão ' + (sessaoNome || 'Padrão'));
    });
  };

  var configCategorias = function(categorias){
    var indexCategoria = 'indexCategoria';
    var index = sharedData.get(indexCategoria) || 0;
    if(!categorias[index])
      index = 0;

    var categoria = categorias[index];
    $scope.categoria = categoria.categoria;
    configProdutos(categoria.produtos, function(){
      if(!sharedData.has(indexCategoria)){
        index++;
        sharedData.set(indexCategoria, index);
      }
      configTimer(categoria.tempo);
    });
  };

  var configProdutos = function(produtos, callback){
    produtos = defineValor.definir(produtos);
    var indexProdutoTabela = 'indexProdutoTabela';
    var restartedIndex = false;
    var useIndex = sharedData.get(indexProdutoTabela) || 0;

    for(var it = 0; it <= maxShow; it++){
      if(!produtos[useIndex]){
        useIndex = 0;
        restartedIndex = true;
      }
      $scope.showingPr.push(produtos[useIndex]);
      useIndex++;
    }

    if(!restartedIndex){
      if(useIndex <= produtos.length){
        sharedData.set(indexProdutoTabela, useIndex);
      }
    }else{
      sharedData.remove(indexProdutoTabela);
    }
    return callback();
  };

  var configTimer = function(tempo){
    $timeout(function(){
      $location.path('/baners');
    }, tempo * 1000);
  };

  var initConfig = function(){
    var nomeSessao = $routeParams.sessao;
    if(sharedData.has('sessao')){
      var ses = sharedData.get('sessao');
      sessaoService.hasUpdate(ses._id)
      .then(function(result){
        if(result.data === ses.hash){
          sessao = ses;
          configCategorias(sessao.categorias);
        }else{
          loadSessao(nomeSessao);
        }
      },
      function(data){
        loadSessao(nomeSessao);
      });
    }else{
      loadSessao(nomeSessao);
    }
  };
  initConfig();
})

.controller("banersController",
function($scope, $timeout, $location, $routeParams, sharedData, sessaoService, defineValor, banersConfig){

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
  }, banersConfig.showTime);
});
