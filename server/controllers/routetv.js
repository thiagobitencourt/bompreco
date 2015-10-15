var express = require('express');

var Categorias = require('../models/categorias');
var Produtos = require('../models/produtos');
var Sessao = require('../models/sessao');

var RouterTv = function(){

	router = express.Router();

	var buscaSessaoPadrao = function(done){
		Sessao.findOne({padrao: true}, function(err, sessao){
			if(err) return done(err, null);
			done(null, sessao);
		});
	}

	router.get('/sessao', function(req, res){

		buscaSessaoPadrao(function(err, sessao){
			if(err){
				console.error("buscaSessaoPadrao Error: " + err.message);
				return res.status(500).send({message: "500: Erro ao carregar sessão padrão"});
			}

			if(sessao){
				return res.status(200).send(sessao);
			}else{
				var message = "Sessão padrão não encontrada";
				console.log(message);
				return res.status(400).send(message);
			}
		});
	});

	router.get('/sessao/:sessao', function(req, res){

		//Redireciona qualquer requisição para a sessão padrão.
		return res.redirect("/tv/sessao");

		var nome = req.params.sessao;
		if(!nome){
			return res.redirect("/tv/sessao");
		}

		console.log("Nome da sessão: " + nome);

		Sessao.findOne({nome: nome}, function(err, sessao){
			if(err){
				console.error("Sessao.findOne Error: " + err.message);
				return res.status(500).send({message: "500: Erro ao carregar sessão"});
			}

			if(sessao){
				res.status(200).send(sessao);
			}
		});
	});

	router.get('/sessao/hash/:id', function(req, res){

		var id = req.params.id;

		if(!id){
			console.error("Error: ID de sessão não informado");
			return res.status(500).send({message: "400: ID de sessão não informado"});
		}

		Sessao.findOne({_id: id}, function(err, sessao){
			if(err){
				console.error("Sessao.findOne Error: " + err.message);
				return res.status(500).send({message: "500: Erro ao carregar sessão"});
			}

			if(sessao){
				res.status(200).send(sessao.hash);
			}
		});
	});

	router.get('images/produtos/:name', function(req, res){

		console.log("Getting Images");

		var imgName = req.params.name;
		res.sendfile('web/private/images/produtos/');
		console.log(dir);
		res.sendfile(dir + imgName);

	});

	router.get('/image/:name', function(req, res){

		var imgName = req.params.name;

		console.log("image name >>> " + imgName);

		var fs = require('fs');
		var dir = 'web/private/images/produtos/';
		console.log(dir);

		fs.readFile(dir + imgName, function (err, data) {
			if (err) throw err;


			// res.sendfile('web/private/images/produtos/' + imgName);

			console.log("Imagem...")
  			// console.log(data);

  			var b = new Buffer(data, 'base64');
  			console.log(b);
			var s = b.toString();
			// console.log(s);
			res.header('Content-type', 'image/jpg');

			// res.headers['Content-type'] = 'image/jpg';
			res.send(b);
		});

		// var dir = 'private/images/produtos/';
		// console.log(dir);

		// res.sendfile('web/private/images/produtos/' + imgName);

		// buscaSessaoPadrao(function(err, sessao){
		// 	if(err){
		// 		console.error("buscaSessaoPadrao Error: " + err.message);
		// 		return res.status(500).send({message: "500: Erro ao carregar sessão padrão"});
		// 	}

		// 	if(sessao){
		// 		return res.status(200).send(sessao);
		// 	}else{
		// 		var message = "Sessão padrão não encontrada";
		// 		console.log(message);
		// 		return res.status(400).send(message);
		// 	}
		// });
	});

	setRouteCategorias();
	setRouteProdutos();
	setRouteSessoes();

	return router;
}

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
};

var setRouteProdutos = function(){
	var expressRouteSimple = "/produtos";
	var expressRouteId =  expressRouteSimple + "/:id";

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
};

var setRouteSessoes = function(){
	//TODO: implement
};

module.exports = RouterTv;
