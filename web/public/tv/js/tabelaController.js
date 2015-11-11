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
    configProdutos(categoria.produtos);
    index++;
    sharedData.set(indexCategoria, index);
    configTimer(categoria.tempo);
  };

  var configProdutos = function(produtos){
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
});
