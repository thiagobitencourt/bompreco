angular.module('bomprecotv').controller('sessaoController', 
    function($scope, Categorias, sessaoService, produtosService){

    $scope.defaultTime = 30;
    $scope.hasSelected = false;

    var lastTab; //Ultima sessão sendo mostrada [ se1 | se2 | se3 | ultimaSes |      < - > (Nova Sessão)] 
    var maxTabs = 6; // Número máximo de sessões sendo mostrada
    var currTabIndex = maxTabs; //Indice da sessão atual.

    var categorias = $scope.categorias = Categorias.data;
    //Sessao apresentada atualmente
    var activeSessao = {};
    var produtosSessao = {};

    var closeAllSes = function(){
        $scope.hasSelected = false;
        activeSessao = {};
        $scope.selectedProdutos = [];
        delete $scope.produtos;
        produtosSessao = {};

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

    /*
    Fecha os produtos carregados.
    */
    var closeAllPr = function(){
        angular.forEach(categorias, function(eachCat){
            eachCat.prShowing = false;
        });
    }

    /*
    Abre a sessão selecionada, apresentando corretamente as categorias e produtos selecionados.
    */
    var openSessao = function(sessao){
        angular.forEach(sessao.categorias, function(sCat){
            angular.forEach(categorias, function(categoria){
                if(sCat._id == categoria._id){
                    categoria.selecionada = true;
                    categoria.tempo = sCat.tempo;
                }
            });
        });

        angular.forEach(sessao.produtos, function(sPro){

            //Carrega todos os produtos para um array. É utilizado para atualização dos produtos selecionados
            produtosSessao[sPro.produto] = sPro;

            angular.forEach(categorias, function(categoria){
                if(sPro.categoria == categoria._id){
                categoria.temProdutosSelecionado = true;
                }
            });
        });
    }

    /*
    Seleciona uma sessão e a configura para ser apresentada.
    */
    $scope.select = function(sessao){

        if(sessao.selected){
            //Ja selecionado, não faz nada e apenas retorna
            return;
        }

        //Fecha o formulário de cadastro de sessão
        $scope.showCadastrarSessaoForm = false;

        //Fecha todas as outras sossões.
        closeAllSes();
        sessao.selected = true;

        //Registra a sessão clicada como corrente/ativa
        activeSessao = sessao;
        $scope.hasSelected = true;
        openSessao(sessao);
    }

    $scope.openProdutos = function(categoria){
        closeAllPr();
        categoria.prShowing = true;

        produtosService.getByCategoriaId(categoria._id).success(function(data, status){

            $scope.produtos = data;

            $scope.produtos.forEach(function(sPro){
                //Se um produto da categoria selecionada está na lista dos produtos da sessão atual, então selecione o produto.
                if(produtosSessao[sPro._id]){
                    sPro.selecionado = true;
                }
            });

        }).error(function(data, status){
            console.log(data);
        });
    }

    $scope.closeProdutos = function(categoria){
        categoria.prShowing = false;
        delete $scope.produtos;
    }

    /*
    Ao clicar na caixa de seleção de um produro, 
    adiciona ou remove este produto da lista de produtos selecionados para a sessão corrente.
    */
    $scope.selecionaProduto = function(produto){

        if(produtosSessao[produto._id]){
            delete produtosSessao[produto._id];
        }else{
            var pr = {produto: produto._id, categoria: produto.categoria};
            produtosSessao[produto._id] = pr;
        }
    }

    /*
    Salva as alterações realizadas na sessão corrente 
    TODO: Manter uma variável que indica que foi realizada alguma alteração na sessão para ativar ou não o botão salvar;
    TODO: Criar um botão de excluir sessão;
    TODO: Criar a opção de definir a sessão com padrão.
    */
    $scope.salvarSessao = function(categorias){
        var salvarCategorias = categorias.filter(function(eachCat){
            return eachCat.selecionada;
        });

        activeSessao.categorias = [];
        salvarCategorias.forEach(function(categoria){
            var objCategoria = {_id: categoria._id, tempo: categoria.tempo};
            activeSessao.categorias.push(objCategoria);
        });

        //Cria o array com os produtos selecionados
        activeSessao.produtos = [];
        angular.forEach(produtosSessao, function(produto){
            activeSessao.produtos.push(produto);
        });

        sessaoService.updateSessao(activeSessao).success(function(data){
            loadSessoes(activeSessao);
        });
    }

    /* 
    Cadastra a nova sessão e fecha o formulário. 
    A mesma função é utilizada para o botão de salvar e cancelar. 
    Quando a função é chamada sem o parâmetro novaSessao então se trata de uma operação de cancelamento, 
    nete caso o formulário é apenas fechado.
    */
    $scope.criarNovaSessao = function(novaSessao){

        if(!novaSessao){
            //Verifica se há sessão para voltar a apresentar a última sessão em visualização.
            if($scope.temSessao == true){
                $scope.showCadastrarSessaoForm = false;
                $scope.hasSelected = true;
                activeSessao.selected = true;
            }
            return;
        }

        sessaoService.newSessao(novaSessao).success(function(data){
            $scope.showCadastrarSessaoForm = false;
            //Após o retorno de sucesso do back-end, recarrega as sessões.
            loadSessoes();
        }).error(function(data){
            console.log(data);
        });
    }

    //Abre o formulário de cadastro de uma nova sessão
    $scope.openNovaSessaoForm = function(){
        $scope.showCadastrarSessaoForm = true;
        $scope.hasSelected = false;
        activeSessao.selected = false;
    }

    //Carrega rodas sessões registradas na base de dados
    var loadSessoes = function(sessaoAtual){

        sessaoService.getSessoes().success(function(data){
            $scope.sessoes = data;

            $scope.temSessao = $scope.sessoes.length > 0? true : false;
            if($scope.temSessao){
                /*
                Ao recarregar as sessões verifica-se se existem sessões. 
                Se existir então uma nova verificação é feita para saber se uma sessão atual esta sendo utilizada.
                Então, em todas as sessões carregadas verifica-se qual destas estava sendo usada como sessão atual e então reestabelece como sessão selecionada.
                */
                var found = false;
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

                /* 
                Se houverem sessões, porém não houver uma sessão atual e nenhuma sessão padrão for encontrada, 
                então seleciona a primeira sessão da lista.
                */
                if(!found){
                    $scope.select($scope.sessoes[0]); 
                }

                /*
                Se houverem mais sessões do que o máximo permitido para visualizações, 
                então é criada e mantida uma 'fila' com as sessões para serem mostradas.

                Veja as funções nextTab() e prevTab() mais abaixo.
                */
                if($scope.sessoes.length > maxTabs){
                    $scope.limit = maxTabs;
                    lastTab = $scope.sessoes.length;
                    console.log("Última: " + lastTab);
                    
                    othersSes = $scope.sessoes;
                    $scope.sessoes = [];

                    for(var i = 0; i < maxTabs; i++){
                        $scope.sessoes.push(othersSes.shift());
                    }

                    $scope.hasMoreTabs = true;
                }
            }
        });
    }

    //Mostra a próxima sessão da 'fila' e esconde a primeira (gira a 'roda' para a direita)
    $scope.netxTab = function(){
        currTabIndex++;

        /*
            Se a primeira sessão estiver seleciona e irá deixar de ser exibida, 
            então deve-se deselecioná-la e seleciona a sessão do seu lado direito.
        */
        if($scope.sessoes[0].selected){
            $scope.select($scope.sessoes[1]);            
        }

        var tmpSes = $scope.sessoes.shift();
        $scope.sessoes.push(othersSes.shift());
        othersSes.push(tmpSes);

        $scope.hasPreviousSession = true;

        if(currTabIndex == lastTab){
            $scope.hasMoreTabs = false;
            return;
        }
    }

    //Mostra a primeira sessão da 'fila' e esconde a última (gira a 'roda' para a esquerda)
    $scope.prevTab = function(){
        currTabIndex--;

        /*
            Se a última sessão estiver seleciona e irá deixar de ser exibida, 
            então deve-se deselecioná-la e seleciona a sessão do seu lado esquerdo.
        */
        if($scope.sessoes[maxTabs-1].selected){
            $scope.select($scope.sessoes[maxTabs-2]);            
        }

        $scope.hasMoreTabs = true;

        var tmpSes = othersSes.pop();
        othersSes.unshift($scope.sessoes.pop());
        $scope.sessoes.unshift(tmpSes);

        if(currTabIndex == maxTabs){
            $scope.hasPreviousSession = false;
            return;
        }
    }

    //Carrega as sessões e abre a primeira para apresentação
    loadSessoes();

});