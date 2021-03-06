var express = require('express');
var logger = require('winston');

var multer  = require('multer');
// var upload = multer({ dest: 'uploads/' })

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // cb(null, 'web/images/produtos/')
    cb(null, 'web/images/produtos/')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
});

var upload = multer({ storage: storage });

var Categorias = require('../models/categorias');
var Produtos = require('../models/produtos');
var Sessao = require('../models/sessao');
var Usuarios = require('../models/users');

var RouterApi = function(){

	router = express.Router();

	setRouteCategorias();
	setRouteProdutos();
	setRouteSessoes();
	setRouteUsers();

	return router;
}

//Funções globais
var qdtProdutosEmCategoria = function(categoriaId, done){

	Produtos.find({categoria: categoriaId}).exec(function(err, produtos){
		if(err){
			return done(err, null);
		}

		return done(null, produtos.length);
	});
}

var removerProdutoDaSessao = function(produto, done){
	/*
	Ao remover um produto, se este produto eh referenciado por uma sessão então esta referência deve ser removida.
	*/
	Sessao.find({produtos: {$elemMatch: {produto: produto._id}}}).exec(function(err, sessoes){
		if(err) return done(err);

		sessoes.forEach(function(ses){
			var keep = [];

			ses.produtos.forEach(function(pr){
				var prStr = pr.produto.toString();
				if(prStr.indexOf(produto._id) == -1){
					keep.push(pr);
				}
			});

			ses.produtos = [];
			ses.produtos = keep;

			ses.save();
		});
		done(null);
	});
}

//Altera a sessão padrão, para deixar de ser padrão
var alterarSessaoPadrao = function(callback){

	/*
	Busca a sessão padrão, se encontrar esta sessão deixa de ser a sessão padrão.
	O callback só recebe parâmetro de erro, então se for null é porque correu tudo bem.
	Está função é usada para alterar a sessão padrão,
	portanto, se uma sessão padrão não for encontrada não tem problema.
	*/
	Sessao.findOne({padrao : true}, function(err, sessao){
		if(err)	return callback(err);

		if(sessao){
			sessao.padrao = null;
			sessao.save(function(err){
				if(err) return callback(err);

				return callback(null);
			});
		}else{
			console.warn("Não havia sessão padrão");
			return callback(null);
		}
	});
};


var setRouteCategorias = function(){

	var expressRouteSimple = "/categorias";
	var expressRouteId =  expressRouteSimple + "/:id";

	//Busca todas as categorias cadastradas
	router.get(expressRouteSimple, function(req, res){

		Categorias.find({}, function(err, categorias){
			if(err){
				console.error("Categorias.find Error: " + err.message);
				return res.status(500).send({message: "500: Erro ao carregar categorias"});
			}

			res.status(200).send(categorias);
		});
	});

	//Busca uma categoria por ID
	router.get(expressRouteId, function(req, res){

		var idCategoria = req.params.id;
		if(!idCategoria){
			console.warn("Categoria não informada");
			return res.status(400).send({message: "Categoria não informada"});
		}

		Categorias.findById(idCategoria, function(err, categoria){
			if(err){
				console.error("Categorias.findById Error: " + err.message);
				return res.status(500).send({message: "500: Erro ao carregar categoria"});
			}

			//Se não encontrar nenhuma categoria, retorna 404
			if(!categoria){
				console.error("Nenhuma categoria encontrada");
				return res.status(404).send({message:"Nenhuma categoria encontrada"});
			}

			res.status(200).send(categoria);
		});
	});

	//Inserir uma nova categoria
	router.post(expressRouteSimple, function(req, res){

		var categoria = req.body.categoria;
		var codigo = req.body.codigo;

		if(!categoria){
			console.warn("Categoria não informada");
			return res.status(400).send({message: "Categoria não informada"});
		}
    else if(!codigo){
			console.warn("Código não informado");
			// return res.status(400).send({message: "Código não informado"});
		}

		var newCategoria = Categorias({
			codigo: codigo,
			categoria: categoria
		});

		newCategoria.save(function(err){
			if(err){
				console.error("newCategoria.save Error: " + err.message);
				return res.status(500).send({message: "500: Erro ao cadastrar nova categoria"});
			}

			console.log("Categoria inserida: " + newCategoria._id);
			res.status(201).send(newCategoria);
		});
	});

	//Atualizar uma categoria por ID
	router.put(expressRouteId, function(req, res){

		var categoriaId = req.params.id;
		var currentCategoria = req.body;

		if(!categoriaId){
			console.warn("Id de categoria inválido: " + categoriaId);
			return res.status(400).send({message: "Id de categoria inválido"});
		}else if(!currentCategoria){
			console.warn("Um objeto categoria é requerido");
			return res.status(400).send({message: "Um objeto categoria é requerido"});
		}

		console.log("Update by ID: " + categoriaId);

		Categorias.findOne({_id: categoriaId}, function(err, categoria){
			if(err){
				console.error("Categorias.findOne Error: " + err.message);
				return res.status(500).send({message: "500: Erro ao carregar categoria"});
			}

			//Se não encontrar nenhuma categoria, retorna 404
			if(!categoria){
				console.error("Nenhuma categoria encontrada");
				return res.status(404).send({message:"Nenhuma categoria encontrada"});
			}

			//Verifica todos os componentes de uma categoria
			try{

				categoria.codigo = currentCategoria.codigo;
				categoria.categoria = currentCategoria.categoria;

			}catch(ex){
				return res.status(400).send({message: "Objeto categoria inválido"});
			}

			categoria.save(function(err, cat){
				if(err){
					console.error("categoria.save Error: " + err.message);
					return res.status(500).send({message: "500: Erro ao atualizar categoria"});
				}

				console.info("Categoria Alterada: " + categoriaId);
				res.status(204).send();
			});
		});
	});

	//Remove uma categoria, por ID
	router.delete(expressRouteId, function(req, res){

		var categoriaId = req.params.id;
		if(!categoriaId){
			console.warn("Id de categoria inválido: " + categoriaId);
			return res.status(400).send({message: "Id de categoria inválido"});
		}

		console.log("Delete by ID: " + categoriaId);
		Categorias.findOne({_id: categoriaId}, function(err, categoria){
			if(err){
				console.error("Categorias.findOne Error: " + err.message);
				return res.status(500).send({message: "500: Erro ao carregar categoria"});
			}

			//Se não encontrar nenhuma categoria, retorna 404
			if(!categoria){
				console.error("Nenhuma categoria encontrada");
				return res.status(404).send({message:"Nenhuma categoria encontrada"});
			}

			qdtProdutosEmCategoria(categoriaId, function(err, numProd){
				if(err){
					console.error("qdtProdutosEmCategoria Error: " + err.message);
					return res.status(500).send({message: "500: Erro ao remover categoria"});
				}

				if(numProd != 0){
					return res.status(400).send({message: "Não é possível remover esta categoria"});
				}

				categoria.remove();
				console.info("Categoria removida");
				res.status(204).send();
			});
		});
	});
};

var setRouteProdutos = function(){

	var expressRouteSimple = "/produtos";
	var expressRouteId =  expressRouteSimple + "/:id";

	//Busca todos os produtos cadastrados
	router.get(expressRouteSimple, function(req, res){

		Produtos.find({}, function(err, produtos){
			if(err){
				console.error("Produtos.find Error: " + err.message);
				return res.status(500).send({message: "500: Erro ao carregar produtos"});
			}

			res.status(200).send(produtos);
		});
	});

	//Busca um produto, por ID
	router.get(expressRouteId, function(req, res){

		var produtoId = req.params.id;

		Produtos.findById(produtoId, function(err, produto){
			if(err){
				console.error("Produtos.findById Error: " + err.message);
				return res.status(500).send({message: "500: Erro ao carregar produto"});
			}

			//Se não encontrar nenhum produto, retorna 404
			if(!produto){
				console.error("Nenhum produto encontrado");
				return res.status(404).send({message:"Nenhum produto encontrado"});
			}

			res.status(200).send(produto);
		});
	});

	//Quantidade de produtos para uma determinada categoria
	router.get(expressRouteSimple + '/length/:categoria', function(req, res){

		var categoriaId = req.params.categoria;
		if(!categoriaId){
			console.warn("Id de categoria inválido: " + categoriaId);
			return res.status(400).send({message: "Id de categoria inválido"});
		}

		qdtProdutosEmCategoria(categoriaId, function(err, numProd){
			if(err){
				console.error("qdtProdutosEmCategoria Error: " + err.message);
				return res.status(500).send({message: "500: Erro ao carregar quantidade de produto"});
			}

			return res.status(200).send([numProd]);
		});
	});

	router.get(expressRouteSimple + '/sessao/:id', function(req, res){

		var sessaoId = req.params.id;
		if(!sessaoId){
			console.warn("Id de sessão inválido: " + sessaoId);
			return res.status(400).send({message: "Id de sessão inválido"});
		}

		Sessao.findOne({_id: sessaoId}, function(err, sessao){
			if(err){
				console.error("Sessao.findOne Error: " + err.message);
				return res.status(500).send({message: "500: Erro ao carregar sessão"});
			}

			//Se não encontrar nenhuma sessao, retorna 404
			if(!sessao){
				console.error("Sessão não encontrada");
				return res.status(404).send({message:"Sessão não encontrada"});
			}

			var produtosSes = [];
			sessao.produtos.forEach(function(pr){
				produtosSes.push(pr.produto);
			});

			Produtos.find({ _id: { "$in" : produtosSes} }, function(err, produtos){
				if(err){
					console.error("Produtos.find Error: " + err.message);
					return res.status(500).send({message: "500: Erro ao carregar produtos da sessão"});
				}

				res.status(200).send(produtos);
			});
		});
	});

	//Todos os produtos de uma categoria
	router.get(expressRouteSimple + '/categoria/:id', function(req, res){

		var categoriaId = req.params.id;
		if(!categoriaId){
			console.warn("Id de categoria inválido: " + categoriaId);
			return res.status(400).send({message: "Id de categoria inválido"});
		}

		Produtos.find({categoria: categoriaId}, function(err, produtos){
			if(err){
				console.error("Produtos.find Error: " + err.message);
				return res.status(500).send({message: "500: Erro ao carregar produtos da categora"});
			}

			res.status(200).send(produtos);
		});
	});

	router.post(expressRouteSimple + '/images', upload.single('image'), function(req, res, next) {
			console.log("Nova imagem salva: " + req.file.filename);
  			return res.status(200).send(req.file.filename);
	});

	//Cadastrar um novo produto
	router.post(expressRouteSimple, function(req, res){

		var produto = req.body;
		if(!produto){
			console.warn("Um objeto produto é requerido");
			return res.status(400).send({message: "Um objeto produto é requerido"});
		}

		//Verifica todos os componentes de um produto
		try{

			var newProduto = Produtos({
				codigo: produto.codigo,
				nome: produto.nome,
				descricao: produto.descricao || '',
				imagem: produto.imagem || '',
				unidadeMedida: produto.unidadeMedida || '',
				valorPadrao: produto.valorPadrao,
				valorEspecial: produto.valorEspecial || [],
				criadoEm: new Date(),
				categoria: produto.categoria
			});
		}catch(ex){
			console.error("Objeto produto inválido: " + ex);
			return res.status(400).send({message: "Objeto produto inválido"});
		}

		newProduto.save(function(err){
			if(err){
				console.error("newProduto.save Error: " + err);
				var message = "500: Erro ao salvar novo produtos";

				if(err.code == 11000){
					message = "Nome de produto já cadastrado";
				}

				return res.status(500).send({message: message});
			}

			console.info("Novo produto cadastrado: " + newProduto._id);
			res.status(201).send(newProduto);
		});
	});

	//Alterar um produto existente, por ID
	router.put(expressRouteId, function(req, res){

		var produtoId = req.params.id;
		var currentProduto = req.body;

		if(!produtoId){
			console.warn("Id de produto inválido: " + produtoId);
			return res.status(400).send({message: "Id de produto inválido"});
		}else if(!currentProduto){
			console.warn("Um objeto produto é requerido");
			return res.status(400).send({message: "Um objeto produto é requerido"});
		}

		console.log("Update by ID: " + produtoId);

		Produtos.findOne({_id: produtoId}, function(err, produto){
			if(err){
				console.error("Produtos.findOne Error: " + err.message);
				return res.status(500).send({message: "500: Erro ao carregar produtos"});
			}

			//Se não encontrar nenhum produto, retorna 404
			if(!produto){
				console.error("Nenhum produto encontrado");
				return res.status(404).send({message:"Nenhum produto encontrado"});
			}

			//Verifica todos os componentes de um produto
			try{

				produto.codigo = currentProduto.codigo;
				produto.nome = currentProduto.nome;
				produto.descricao = currentProduto.descricao || '';
				produto.imagem = currentProduto.imagem || '';
				produto.unidadeMedida = currentProduto.unidadeMedida || '';
				produto.valorPadrao = currentProduto.valorPadrao || '';
				produto.valorEspecial = currentProduto.valorEspecial || [];
				produto.categoria = currentProduto.categoria || produto.categoria;

			}catch(ex){
				return res.status(400).send({message: "Objeto produto inválido"});
			}

			produto.save(function(err, cat){
				if(err){
					console.error("Error: " + err.message);
					return res.status(500).send({message: "500: Erro ao atualizar produto"});
				}

				console.info("Produto Alterado: " + produtoId);
				res.status(204).send();
			});
		});
	});

	//Remover um produto, por ID
	router.delete(expressRouteId, function(req, res){

		var produtoId = req.params.id;
		if(!produtoId){
			console.warn("Id de produto inválido: " + produtoId);
			return res.status(400).send({message: "Id de produto inválido"});
		}

		console.log("Delete by ID: " + produtoId);
		Produtos.findOne({_id: produtoId}, function(err, produto){
			if(err){
				console.error("Error: " + err.message);
				return res.status(500).send({message: "500: Erro ao carregar produto"});
			}

			//Se não encontrar nenhum produto, retorna 404
			if(!produto){
				console.error("Nenhum produto encontrado");
				return res.status(404).send({message:"Nenhum produto encontrado"});
			}

			//TODO: Remover referencias em todas as categorias que este produto esta contido

			removerProdutoDaSessao(produto, function(err){
				if(err){
					console.error("removerProdutoDaSessao Error: " + err.message);
					return res.status(500).send({message: "500: Erro ao atualizar sessao com este produto"});
				}

				produto.remove();
				console.info("Produto removido");
				return res.status(204).send();
			});

		});
	});
};

var setRouteSessoes = function(){

	var expressRouteSimple = "/sessoes";
	var expressRouteId =  expressRouteSimple + "/:id";

	//Busca todas as sessões cadastradas
	router.get(expressRouteSimple, function(req, res){

		Sessao.find({}).exec(function(err, sessoes){
			if(err){
				console.error("Sessao.find Error: " + err.message);
				return res.status(500).send({message: "500: Erro ao carregar sessões"});
			}

			res.status(200).send(sessoes);
		});
	});

	//Busca uma sessão, por ID
	router.get(expressRouteId, function(req, res){

		var sessaoId = req.params.id;
		if(!sessaoId){
			console.warn("Id de sessão inválido: " + sessaoId);
			return res.status(400).send({message: "Id de sessão inválido"});
		}

		Sessao.findOne({_id: sessaoId}, function(err, sessao){
			if(err){
				console.error("Error: " + err.message);
				return res.status(500).send({message: "500: Erro ao carregar sessão"});
			}

			//Se não encontrar nenhuma sessao, retorna 404
			if(!sessao){
				console.error("Nenhuma sessao encontrada");
				return res.status(404).send({message:"Nenhuma sessao encontrada"});
			}

			res.status(200).send(sessao);
		});
	});

	router.get(expressRouteSimple + '/:nome', function(req, res){

		var sessaoNome = req.params.nome;
		if(!sessaoNome){
			console.warn("Nome de sessão inválido: " + sessaoNome);
			return res.status(400).send({message: "Nome de sessão inválido"});
		}

		Sessao.findOne({nome: sessaoNome}, function(err, sessao){
			if(err){
				console.error("Sessao.findOne Error: " + err.message);
				return res.status(500).send({message: "500: Erro ao carregar sessão"});
			}

			//Se não encontrar nenhuma sessao, retorna 404
			if(!sessao){
				console.error("Nenhuma sessao encontrada");
				return res.status(404).send({message:"Nenhuma sessao encontrada"});
			}

			res.status(200).send(sessao);
		});
	});

	//Insere uma nova sessão
	router.post(expressRouteSimple, function(req, res){

		var sessao = req.body;
		if(!sessao){
			console.warn("Um objeto sessão é requerido");
			return res.status(400).send({message: "Um objeto sessão é requerido"});
		}

		console.warn(JSON.stringify(sessao));

		//Valida os campos da sessão
		try{
			var newSessao = new Sessao({
				nome: sessao.nome,
				categorias: sessao.categorias || [],
				produtos: sessao.produtos || []
			});

			//Se a nova sessão será padrão, então altera a sessão padrão atual
			if(sessao.padrao && sessao.padrao === true ){
				alterarSessaoPadrao(function(err){
					if(err){
						console.error("alterarSessaoPadrao Error: " + err.message);
						return res.status(500).send({message: "500: Erro ao alterar sessão padrão"});
					}
					newSessao.padrao = sessao.padrao;

					newSessao.save(function(err){
						if(err){
							console.error("newSessao.save Error 1: " + err);
							return res.status(500).send({message: "500: Erro ao salvar nova sessão"});
						}

						console.info("Nova sessão cadastrada: " + newSessao._id);
						res.status(201).send(newSessao);
					});
				});

			}else{
				newSessao.save(function(err){
					if(err){
						console.error("newSessao.save Error 2: " + err);
						return res.status(500).send({message: "500: Erro ao salvar nova sessão"});
					}

					console.info("Nova sessão cadastrada: " + newSessao._id);
					res.status(201).send(newSessao);
				});
			}

		}catch(ex){
			return res.status(400).send({message: "Objeto sessão inválido"});
		}


	});

	//Altera uma sessão existe, por ID
	router.put(expressRouteId, function(req, res){

		var sessaoId = req.params.id;
		var currentSessao = req.body;

		if(!sessaoId){
			console.warn("Id de sessão inválido: " + sessaoId);
			return res.status(400).send({message: "Id de sessão inválido"});
		}else if(!currentSessao){
			console.warn("Um objeto sessão é requerido");
			return res.status(400).send({message: "Um objeto sessão é requerido"});
		}

		console.log("Update by ID: " + sessaoId);
		Sessao.findOne({_id: sessaoId}, function(err, sessao){
			if(err){
				console.error("Sessao.findOne Error: " + err.message);
				return res.status(500).send({message: "500: Erro ao carregar sessão"});
			}

			//Se não encontrar nenhuma sessao, retorna 404
			if(!sessao){
				console.error("Nenhuma sessao encontrada");
				return res.status(404).send({message:"Nenhuma sessao encontrada"});
			}

			try{

        //TODO: Mudar. Se currentSessao não tem categorias é pq deve ser salvo assim, não faz sentido manter o sessao.categorias.
				sessao.nome = currentSessao.nome;
				sessao.categorias = currentSessao.categorias || sessao.categorias || [];
				sessao.produtos = currentSessao.produtos || sessao.produtos || [];

				//Sessão esta sendo definida para padrão. Altera sessão padrão atual
				if(currentSessao.padrao === true && !sessao.padrao){
					alterarSessaoPadrao(function(err){
						if(err){
							console.error("alterarSessaoPadrao Error 2: " + err.message);
							return res.status(500).send({message: "500: Erro ao alterar sessão padrão"});
						}
						sessao.padrao = currentSessao.padrao;

						sessao.save(function(err){
              if(err){
                console.error("Error0: " + err);
                return res.status(500).send({message: 'Erro ao salvar sessão'});
              }
						  console.info("Sessão Alterada");
						  res.status(204).send();
            });
					});
				}else if(!currentSessao.padrao && sessao.padrao === true){
					sessao.padrao = null;

					sessao.save(function(err){
						if(err){
							console.error("Error0: " + err);
							// return res.status(500).send(err.message);
						}
						console.info("Sessão Alterada");

						Sessao.findOne({}, function(err, sessaoPadrao){
							if(err){
								console.error("Error1: " + err);
								// return res.status(500).send(err.message);
							}

							if(sessaoPadrao){
								console.log("Nova sessão padrão: " + sessaoPadrao.nome);
								sessaoPadrao.padrao = true;
								sessaoPadrao.save(function(err){
									if(err){
										console.error("Error2: " + err);
										// return res.status(500).send(err.message);
									}
									return res.status(204).send();
								});
							}else{
								return res.status(204).send();
							}
						});
					});
				}else{
          sessao.save(function(err){
            if(err){
              console.error("Error0: " + err);
              return res.status(500).send({message: 'Erro ao salvar sessão'});
            }
            console.info("Sessão Alterada");
            res.status(204).send();
          });
				}

			}catch(ex){
				return res.status(400).send({message: "Objeto sessão inválido"});
			}
		});
	});

	//Remove uma sessão existente, por ID
	router.delete(expressRouteId, function(req, res){

		var sessaoId = req.params.id;
		if(!sessaoId){
			console.warn("Id de sessão inválido: " + sessaoId);
			return res.status(400).send({message: "Id de sessão inválido"});
		}

		console.log("Delete by ID: " + sessaoId);
		Sessao.findOne({_id: sessaoId}, function(err, sessao){
			if(err){
				console.error("Sessao.findOne Error: " + err);
				return res.status(500).send({message: "500: Erro ao carregar sessão"});
			}

			//Se não encontrar nenhuma sessao, retorna 404
			if(!sessao){
				console.error("Nenhuma sessao encontrada");
				return res.status(404).send({message:"Nenhuma sessao encontrada"});
			}

			var wasPadrao;
			if(sessao.padrao === true){
				wasPadrao = true;
			}

			sessao.remove();

			//Se a sessão removida era padrão, então define outra sessão como padrão.
			if(wasPadrao){
				Sessao.findOne({}, function(err, sessaoPadrao){
					if(err){
						console.error("Error: " + err.message);
						// return res.status(500).send(err.message);
					}

					if(sessaoPadrao){
						sessaoPadrao.padrao = true;
						sessaoPadrao.save(function(err){
							if(err){
								console.error("Error: " + err.message);
								// return res.status(500).send(err.message);
							}
							return res.status(204).send();
						});
					}else{
						return res.status(204).send();
					}
				});
			}else{
				return res.status(204).send();
			}

			console.info("Sessão removida");
		});
	});
};

var setRouteUsers = function(){
	//TODO: implementar CRUD de usuários

	var expressRouteSimple = "/usuarios";
	var expressRouteId =  expressRouteSimple + "/:id";

	// Usuarios

	router.get(expressRouteSimple, function(req, res){
		Usuarios.secureFind(null, function(err, user){
			if(err){
				var errMsg = "Erro ao buscar usuários";
				logger.error(errMsg + ": " + err);
				return res.status(500).send({message:err});
			}

			res.send(user);
		});
	});

	router.get(expressRouteId, function(req, res){

		Usuarios.secureFind(req.params.id, function(err, user){
			if(err){
				var errMsg = "Erro ao buscar usuário";
				logger.error(errMsg + ": " + err);
				return res.status(500).send({message:err});
			}

			if(user){
				return res.send(user);
			}else{
				return res.status(400).send({message:"Usuário não encontrado"});
			}
		});
	});

	router.post(expressRouteSimple, function(req, res){

		var user = new Usuarios(req.body);
		user.save(function(err, newUser){

			if(err){
				var errMsg = "Erro ao salvar usuário";
				logger.error(errMsg + ": " + err);
				if(err.code == 11000){
					err = "Usuário ja existe";
				}
				return res.status(500).send({message:err});
			}

			res.send(newUser);
		});
	});

	router.put(expressRouteId, function(req, res){

		if(req.body._id)
			delete req.body._id;

		Usuarios.secureUpdate(req.params.id, req.body, function(err, newUser){
			if(err){
				var errMsg = "Erro ao salvar usuário";
				logger.error(errMsg + ": " + err);
				return res.status(500).send({message:err});
			}

			if(newUser){
				return res.send(newUser);
			}else{
				return res.status(400).send({message:"Usuário não encontrado"});
			}

		});
	});

	router.delete(expressRouteId, function(req, res){
		Usuarios.secureFind(req.params.id, function(err, user){
			if(err){
				var errMsg = "Erro ao buscar usuário";
				logger.error(errMsg + ": " + err);
				return res.status(500).send({message:err});
			}

			if(user){
				user.remove(function(err, us){

					if(err){
						var errMsg = "Erro ao remover usuário";
						logger.error(errMsg + ": " + err);
						return res.status(500).send({message:err});
					}

					return res.send(us.clean());
				});
			}else{
				return res.status(400).send({message:"Usuário não encontrado"});
			}
		});
	});
};

module.exports = RouterApi;
