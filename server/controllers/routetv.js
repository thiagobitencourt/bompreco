var express = require('express');

var Categorias = require('../models/categorias');
var Produtos = require('../models/produtos');
var Sessao = require('../models/sessao');

var RouterTv = function(){

	router = express.Router();

	router.get('/sessao', function(req, res){
		Sessao.findOne({padrao: true}, function(err, sessao){
			if(err) return res.status(500).send();

			if(sessao){
				res.status(200).send(sessao);
			}
		});
	});

	router.get('/sessao/:sessao', function(req, res){
		var nome = req.params.sessao;
		if(!nome){
			return res.redirect("/padrao");
		}

		console.log("Nome da sessão: " + nome);

		Sessao.findOne({nome: nome}, function(err, sessao){
			if(err) return res.status(500).send();

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