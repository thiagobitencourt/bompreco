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
	//TODO: implement
};

var setRouteProdutos = function(){
	//TODO: implement
};

var setRouteSessoes = function(){
	//TODO: implement
};

module.exports = RouterTv;