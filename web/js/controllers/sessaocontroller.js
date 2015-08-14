angular.module('bomprecotv').controller('sessaoController', function($scope, Sessoes, Categorias, sessaoService, produtosService){
  
  $scope.defaultTime = 30;
  $scope.hasSelected = false;
  $scope.sessoes = Sessoes.data;

  //Se o array de sessão for maior que zero então a variavel temSessao é true, se for menor que zero então NÃO tem sessao
  $scope.temSessao = $scope.sessoes.length > 0? true : false;

  var categorias = $scope.categorias = Categorias.data;
  //Sessao apresentada atualmente
  var activeSessao = {};

  var closeAllSes = function(){
    $scope.hasSelected = false;
    activeSessao = {};
    $scope.selectedProdutos = [];
    delete $scope.produtos;

    angular.forEach($scope.sessoes, function(eachSes){
      eachSes.selected = false;
    });

    angular.forEach(categorias, function(eachCat){
      eachCat.selecionada = false;
      eachCat.tempo = $scope.defaultTime;
    });

    closeAllPr();
  }

  var closeAllPr = function(){
    angular.forEach(categorias, function(eachCat){
      eachCat.prShowing = false;
    });
  }

  var openSessao = function(sessao){
    // closeSessao();
    angular.forEach(sessao.categorias, function(sCat){
      angular.forEach(categorias, function(categoria){
        if(sCat._id == categoria._id){
          categoria.selecionada = true;
          categoria.tempo = sCat.tempo;
        }
      });
    });

    angular.forEach(sessao.produtos, function(sPro){
      angular.forEach(categorias, function(categoria){
        if(sPro.categoria == categoria._id){
          categoria.temProdutosSelecionado = true;
        }
      });
    });
  }

  $scope.select = function(sessao){
    
    if(sessao.selected){
      //Ja selecionado, não faz nada
      return;
    }

    $scope.showCadastrarSessaoForm = false;
    
    closeAllSes();
    sessao.selected = true;
    activeSessao = sessao;
    $scope.hasSelected = true;
    openSessao(sessao);
  }

  $scope.openProdutos = function(categoria){
    closeAllPr();
    categoria.prShowing = true;

    produtosService.getByCategoriaId(categoria._id).success(function(data, status){

      $scope.produtos = data;

      angular.forEach(activeSessao.produtos, function(sPro){
        angular.forEach($scope.produtos, function(pr){
          if(pr._id == sPro.produto){
            pr.selecionado = true;
            $scope.selecionaProduto(pr);
            // $scope.selectedProdutos.push(pr);
          }
        });
      });
    }).error(function(data, status){
      console.log(data);
    });
  }

  $scope.closeProdutos = function(categoria){
    categoria.prShowing = false;
    delete $scope.produtos;
  }

  $scope.selecionaProduto = function(produto){
    if(produto.selecionado == false){
      console.log("Removendo");
      var index = $scope.selectedProdutos.indexOf(produto);
      console.log("index " + index);
      $scope.selectedProdutos.splice(index, 1);
      console.log($scope.selectedProdutos);
    }else{
      var cadastrar = true;
      $scope.selectedProdutos.forEach(function(pr){
        if(pr.codigo == produto.codigo){
          // console.log("já cadastrado");
          cadastrar = false;
        }
      });
      if(cadastrar == true){
        console.log("Cadastrando");
        $scope.selectedProdutos.push(produto);
      }
    }
  }

  $scope.salvarSessao = function(categorias){
    var salvarCategorias = categorias.filter(function(eachCat){
      return eachCat.selecionada;
    });

    activeSessao.categorias = [];
    salvarCategorias.forEach(function(categoria){
      var objCategoria = {_id: categoria._id, tempo: categoria.tempo};
      activeSessao.categorias.push(objCategoria);
    });

    $scope.selectedProdutos.forEach(function(produto){
      var objProduto = {categoria: produto.categoria, produto: produto._id};
      activeSessao.produtos.push(objProduto);
    });

    // console.log($scope.selectedProdutos);
    console.log(activeSessao);
    // activeSessao.nome = "Sessao3";
    sessaoService.updateSessao(activeSessao).success(function(date){
      reloadSessoes();
    });
  }

  $scope.criarNovaSessao = function(novaSessao){
    if(!novaSessao){
      $scope.showCadastrarSessaoForm = false;
      $scope.hasSelected = true;
      activeSessao.selected = true;
      return;
    }
    console.log(novaSessao);
    sessaoService.newSessao(novaSessao).success(function(data){
      $scope.showCadastrarSessaoForm = false;
      reloadSessoes();
    }).error(function(data){
      console.log(data);
      // $scope.novaSessaoError = "Erro ao cadastrar a sessão '" + novaSessao.nome + "'";
      // $scope.novaSessaoForm.$setPristine();
    });
  }

  $scope.openNovaSessaoForm = function(){
    $scope.showCadastrarSessaoForm = true;
    $scope.hasSelected = false;
    activeSessao.selected = false;
  }

  var reloadSessoes = function(){
    sessaoService.getSessoes().success(function(data){
      $scope.sessoes = data;
    });
  }

});