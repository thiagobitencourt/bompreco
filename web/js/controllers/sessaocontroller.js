angular.module('bomprecotv').controller('sessaoController', function($scope, Sessoes, Categorias, sessaoService, produtosService){
  
  $scope.defaultTime = 30;
  $scope.hasSelected = false;
  // $scope.sessoes = Sessoes.data;

  //Se o array de sessão for maior que zero então a variavel temSessao é true, se for menor que zero então NÃO tem sessao
  

  var categorias = $scope.categorias = Categorias.data;
  //Sessao apresentada atualmente
  var activeSessao = {};

  var includeThis = [];

  var closeAllSes = function(){
    $scope.hasSelected = false;
    activeSessao = {};
    $scope.selectedProdutos = [];
    delete $scope.produtos;
    includeThis = [];

    angular.forEach($scope.sessoes, function(eachSes){
      eachSes.selected = false;
    });

    angular.forEach(categorias, function(eachCat){
      eachCat.selecionada = false;
      eachCat.tempo = $scope.defaultTime;
      eachCat.temProdutosSelecionado = false;
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
          includeThis.push(sPro);
          console.log(includeThis);
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

      activeSessao.produtos.forEach(function(produto){
        $scope.produtos.forEach(function(sPro){
          if(produto.produto == sPro._id){
            sPro.selecionado = true;
            $scope.selecionaProduto(sPro);
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

      var remover = false;
      var index = -1;

      includeThis.forEach(function(pr){
        index++;
        if(pr.produto == produto._id){
          // console.log("já cadastrado");
          remover = true;
        }
      });

      if(remover == true){
        console.log("Remover index: " + index);
        includeThis.splice(index, 1);
      }

      // var index = $scope.selectedProdutos.indexOf(produto);
      // console.log("index " + index);
      // $scope.selectedProdutos.splice(index, 1);
      console.log(includeThis);
    }else{
      var cadastrar = true;
      
      // includeThis.forEach(function(pr){
      //   if(pr.codigo == produto.codigo){
      //     // console.log("já cadastrado");
      //     cadastrar = false;
      //   }
      // });

      // $scope.selectedProdutos.forEach(function(pr){
      //   if(pr.codigo == produto.codigo){
      //     // console.log("já cadastrado");
      //     cadastrar = false;
      //   }
      // });

      includeThis.forEach(function(pr){
        if(pr.produto ==  produto._id){
          console.log("já cadastrado");
          cadastrar = false;
        }
      });

      if(cadastrar == true){
        console.log("Cadastrando");
        var obj = {categoria: produto.categoria, produto: produto._id};
        includeThis.push(obj);
        // $scope.selectedProdutos.push(produto);
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

    activeSessao.produtos = includeThis;

    // $scope.selectedProdutos.forEach(function(produto){
    //   console.log(produto);
    //   var objProduto = {categoria: produto.categoria, produto: produto._id};
    //   activeSessao.produtos.push(objProduto);
    //   console.log(activeSessao.produtos);
    // });

    // console.log($scope.selectedProdutos);
    console.log(activeSessao);
    // activeSessao.nome = "Sessao3";
    sessaoService.updateSessao(activeSessao).success(function(data){
      reloadSessoes(activeSessao);
    });
  }

  $scope.criarNovaSessao = function(novaSessao){
    if(!novaSessao){
      if($scope.temSessao == true){
        $scope.showCadastrarSessaoForm = false;
        $scope.hasSelected = true;
        activeSessao.selected = true;
      }
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

  var reloadSessoes = function(sessaoAtual){
    sessaoService.getSessoes().success(function(data){
      $scope.sessoes = data;

      $scope.temSessao = $scope.sessoes.length > 0? true : false;
      if($scope.temSessao){
        /*
          Ao recarregar as sessões verifica-se se existem sessões. 
          Se existir então uma nova verificação é feita para saber se uma sessão atual esta sendo utilizada.
          Então, em todas as sessões carregadas verifica-se qual destas estava sendo usada como sessão atual e então reetabelece como sessão selecionada.
        */
        var found;
        if(sessaoAtual){

          $scope.sessoes.forEach(function(sessao){
            
            if(sessao._id == sessaoAtual._id){
              found = true;
              return $scope.select(sessao);    
            }
          });

        }else{
          /*
            Se não houver uma sessão atual então busca a sessão padrão para apresentação 
          */
          $scope.sessoes.forEach(function(sessao){
            if(sessao.padrao == true){
              found = true;
              return $scope.select(sessao);    
            }
          });
        }

        // Se não houver uma sessão atual e nenhuma sessão padrão for encontrada, então abre a primeira sessão da lista
        if(!found){
          $scope.select($scope.sessoes[0]); 
        }
      }

    });
  }

  //Carrega as sessões e abre a primeira para apresentação
  reloadSessoes();

});