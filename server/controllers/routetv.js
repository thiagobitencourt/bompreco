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

	setRouteCategorias();
	setRouteProdutos();
	setRouteSessoes();

	return router;
}

var setRouteCategorias = function(){
	//TODO: implement
};

var setRouteProdutos = function(){
	//TODO: implement
};

var setRouteSessoes = function(){
	//TODO: implement
};

module.exports = RouterTv;