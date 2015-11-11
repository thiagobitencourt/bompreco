var express = require('express');
var Categorias = require('../models/categorias');
var Produtos = require('../models/produtos');
var Sessao = require('../models/sessao');

var RouterTv = function(){
	router = express.Router();
	setRouteSessoes();
	return router;
}

var findProdutosByCategoria = function(categoria, callback){
	var errH = function(err){
		console.error("Produtos.find Error: " + err.message);
		return callback({message: "500: Erro ao carregar produtos da categora"});
	};
	Produtos.find({categoria: categoria._id}, function(err, produtos){
		if(err)
			return errH(err);
		Categorias.findById(categoria._id, function(err, cate){
			if(err)
				return errH(err);
			callback(null, {tempo: categoria.tempo, produtos: produtos, categoria: cate.categoria});
		});
	});
}

var findProdutosByArray = function(arrayProdutos, callback){
	Produtos.find({ _id: { "$in" : arrayProdutos} }, function(err, produtos){
		if(err){
			console.error("Produtos.find Error: " + err.message);
			return callback({message: "500: Erro ao carregar produtos da sessão"});
		}
		callback(null, produtos);
	});
};

var setRouteSessoes = function(){
	var getSessao = function(name, callback){
		//get By name or get default
		var query = name? {nome:name} : {padrao:true};
		Sessao.findOne(query, function(err, sessao){
			if(err) {
				console.log('Erro ao buscar sessão: ' + err);
				return callback(err);
			}
			if(sessao){
				var responseSessao = {};
				responseSessao.nome = sessao.nome;
				responseSessao._id = sessao._id;
				responseSessao.hash = sessao.hash;
				responseSessao.categorias = [];

				var produtosSes = [];
				sessao.produtos.forEach(function(pr){
					produtosSes.push(pr.produto);
				});

				findProdutosByArray(produtosSes, function(err, prodt){
					if(err) {
						console.log('Erro ao carregar produtos: ' + err);
						return callback(err);
					}
					responseSessao.produtos = prodt;
					var index = 0;
					var loadCategoria = function(){
						if(sessao.categorias[index]){
							var categoria = sessao.categorias[index];
							index++;
							findProdutosByCategoria(categoria, function(err, produtos){
								if(err){
									console.log("Error ao carregar produtos: " + err);
									return callback(err);
								}
								responseSessao.categorias.push(produtos);
								loadCategoria();
							});
						}else{
							callback(null, responseSessao);
						}
					}
					loadCategoria();
				});
			}else{
				return callback(null, null);
			}
		});
	};

	var handle = function(req, res){
		var sesName = req.params.name;
		sesName = null; //Remover para permitir carregar outras sessões, além da sessão padrão.
		getSessao(sesName, function(err, sessao){
			if(err){
				console.error('Erro ao carregar sessão: ' + err);
				res.status(500).send('Erro ao carregar sessão');
			}
			if(sessao){
				res.send(sessao);
			}else{
				res.status(404).send({message: 'Sessão não encontrada'});
			}
		});
	}

	var getHash = function(req, res){
		var id = req.params.id;
		if(!id){
			console.error("Error: ID de sessão não informado");
			return res.status(500).send({message: "400: ID de sessão não informado"});
		}
		Sessao.findById(id, function(err, sessao){
			if(err){
				console.error("Sessao.findById Error: " + err.message);
				return res.status(500).send({message: "500: Erro ao carregar sessão"});
			}
			if(sessao){
				res.status(200).send(sessao.hash);
			}else{
				res.status(400).send({message: "400: ID de sessão não encontrado"});
			}
		});
	};

	router.get('/sessao', handle);
	router.get('/sessao/:name', handle);
	router.get('/sessao/hash/:id', getHash);
};

module.exports = RouterTv;
