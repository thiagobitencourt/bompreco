angular.module('bomprecotv').controller('produtosController', function(fileUpload, $scope, Produtos, categoriasService, produtosService){

	/*
	TODO: No formulario de cadastro de novo produto. 
	Ao selecionar uma imagem e cancelar a operação de cadastro a imagem não é retirada do campo 
	e ao clicar novamente no botão de novo Produto a mesma imagem ainda esta carregada.
	Não encontrei uma maneira de limpar a imagem ao cancelar ou ao salvar. 
	Possível solução usando ng-file-upload: https://github.com/danialfarid/ng-file-upload
	*/

	var produtos = $scope.produtos = Produtos.data;
	var categorias = [];
	var updating = false;

	var loadCategorias = function(){
		categoriasService.getCategorias().success(function(data){

			categorias = $scope.categorias = data;

			angular.forEach(categorias, function(categoria){
				angular.forEach(produtos, function(produto){
					if(produto.categoria == categoria._id){
						produto.categoriaNome = categoria.categoria;
						return;
					}
				});
			});

		}).error(function(data){
			console.log(data);
		});
	}

	var loadProdutos = function(){

		produtosService.getProdutos().success(function(data){

			produtos = $scope.produtos = data;
			loadCategorias();

		}).error(function(data){
			console.log(data);
		});

	}

	$scope.editar = function(produto){
		$scope.novoProduto = produto;

		angular.forEach(categorias, function(categoria){
			if(categoria._id == produto.categoria){
				$scope.paraCategoria = categoria;
				return;
			}
		});

		$scope.showProdutoForm = true;
		updating = true;
	}

	$scope.excluir = function(produto){
		// console.log(produto);

		produtosService.deleteProduto(produto._id).success(function(data){
			loadProdutos();
		}).error(function(data){

		});
	}

	$scope.criarNovoProduto = function(novoProduto){

		if(!novoProduto){
			delete $scope.novoProduto;
			delete $scope.produtoImagem;
			$scope.showProdutoForm = false;
			return;
		}

		var weekDay = new Array(7);
	    weekDay[0] = "segunda-feira";
	    weekDay[1] = "terça-feira"; 
	    weekDay[2] = "quarta-feira";
		weekDay[3] = "quinta-feira";
		weekDay[4] = "sexta-feira";
		weekDay[5] = "sábado";
		weekDay[6] = "domingo";

		var dias = {};
		novoProduto.valorEspecial = [];

		for(var i in novoProduto.dias){
			var dia = {} ;
			dia[weekDay[i]] = novoProduto.dias[i];

			var obj = {dia: weekDay[i], valor: novoProduto.dias[i]};
			console.log(obj);

			novoProduto.valorEspecial.push(obj);
		}
		
			// console.log(JSON.stringify(dias));

		// novoProduto.valorEspecial.forEach(function(dia){
		// 	console.log("dia");
		// 	console.log(dia);
		// });

		var success = function(data){
			$scope.showProdutoForm = false;
			delete $scope.produtoImagem;
			loadProdutos();
		}

		var error = function(data){
			console.log(data);
		}

		novoProduto.categoria = $scope.paraCategoria._id;
		// novoProduto.valorEspecial = JSON.parse(dias);

		console.log(novoProduto.valorEspecial);

		if(updating == true){
			if($scope.produtoImagem){
				var file = $scope.produtoImagem;
				fileUpload.uploadFile(file).success(function(data){
				novoProduto.imagem = data;
				console.log(novoProduto);
				produtosService.updateProduto(novoProduto).success(success).error(error);
			});
			}else{
				produtosService.updateProduto(novoProduto).success(success).error(error);
			}
		}else{
			var file = $scope.produtoImagem;
			fileUpload.uploadFile(file).success(function(data){
				novoProduto.imagem = data;
				console.log(novoProduto);
				produtosService.postProduto(novoProduto).success(success).error(error);
			});
		}
	}

	loadCategorias();
});