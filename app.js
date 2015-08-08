var express = require('express'); 
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(express.static('web/'));
app.get('/', function(req, res, next){
	res.sendfile('web/index.html');
});

var Categorias = require('./models/categorias');
var Produtos = require('./models/produtos');
var Sessao = require('./models/sessao');

app.get('/sessao', function(req, res){

	// Sessao.find({}).populate('categorias').exec(function(err, sessoes){
		Sessao.find({}).exec(function(err, sessoes){
		if(err) return res.status(500).send(err);

		res.status(200).send(sessoes);
	});
});

app.delete('/sessao/erase/:sure', function(req, res){

	var isSure = req.params.sure;
	console.log("APENAS TESTES >> Não estará em produção!");

	if(isSure == 'true'){
		Sessao.remove({}, function(err){

			if(err) return res.status(500).send({error: 'Erro ao remover sessoes', message: err.message});

			return res.status(200).send({message: "Todos as sessoes foram deletadas!"});
		});
	}else{
		res.status(400).send({message: "You almost made a mess"});
	}
});

app.post('/sessao', function(req, res){

	console.log(JSON.stringify(req.body.padrao));

	if(!req.body.padrao == true){
		console.log("here");
		var newSes = Sessao({
			nome: req.body.nome,
			categorias: req.body.categorias,
			produtos: req.body.produtos
		});

		newSes.save(function(err){
			if(err) return res.status(500).send(err);

			return res.status(200).send(newSes);
		});
	}else{
		var newSes = Sessao({
			nome: req.body.nome,
			categorias: req.body.categorias,
			produtos: req.body.produtos,
			padrao: req.body.padrao
		});
	
		Sessao.findOne({padrao : true}, function(err, sessao){
			if(err) return console.log(err.toString());

			if(sessao != null){
				console.log("Sessao encontrada " + sessao);			
				sessao.padrao = null;
				sessao.save(function(err){
					if(err) return console.log(err.toString());

					console.log("Alterado: " + sessao);

					newSes.save(function(err){
					if(err) return res.status(500).send(err);

					res.status(200).send(newSes);
				});
				});
			}else{
				newSes.save(function(err){
					if(err) return res.status(500).send(err);

					res.status(200).send(newSes);
				});
			}
		});

	}
	
});

app.get('/categorias', function(req, res){

	Categorias.find({}).where('ativa').equals(true).exec(function(err, categorias){
		if(err) return res.status(500).send({error: err});

		res.status(200).send(categorias);
	});
});

app.get('/categorias/all', function(req, res){

	Categorias.find({}, function(err, categorias){
		if(err) return res.status(500).send({error: 'error to save categoria'});

		res.status(200).send(categorias);
	});
});

app.get('/categorias/:id', function(req, res){

	console.log(req.params.id);

	var idCategoria = req.params.id;

	Categorias.findById(idCategoria, function(err, categoria){
		if(err) return res.status(500).send({error: 'error to save categoria'});

		res.status(200).send(categoria);
	});
});

app.post('/categorias', function(req, res){

	var categoria = req.body.categoria;
	var codigo = req.body.codigo;

	if(req.body.ativa){
		var ativa = req.body.ativa;
	}else{
		var ativa = true;
	}

	var newCat = Categorias({
		codigo: codigo,
		categoria: categoria,
		ativa: ativa,
		sessao: req.body.sessao
	});

	// res.status(200).send({message: 'Nova categoria salva', data: newCat});

	newCat.save(function(err){
		if(err) return res.status(500).send({error: 'error to save categoria', message: err.message});

		res.status(200).send({message: 'Nova categoria salva', data: newCat});
	});
});

app.put('/categorias/:id', function(req, res){
	res.status(501).send({message: 'Unimplemented'});
});

app.delete('/categorias/:id', function(req, res){

	var idCategoria = req.params.id;
	Categorias.findByIdAndUpdate(idCategoria, { ativa: 'false' }, function(err, categoria) {

		if(err) return res.status(500).send({error: 'error on remove categoria', message: err.message});

		res.status(200).send({message: 'Categoria removida', categoria: categoria});
	});
});

//Apaga TODAS as categorias da base de dados. SEM PENSAR DUAS VEZES. CUIDADO
app.delete('/categorias/erase/:sure', function(req, res){

	var isSure = req.params.sure;
	console.log("APENAS TESTES >> Não estará em produção!");

	if(isSure == 'true'){
		Categorias.remove({}, function(err){

			if(err) return res.status(500).send({error: 'Erro ao remover categorias', message: err.message});

			return res.status(200).send({message: "Todos as categorias foram deletadas!"});
		});
	}else{
		res.status(400).send({message: "You almost made a mess"});
	}
});


app.get('/produtos', function(req, res){

	Produtos.find({}).where('ativo').equals(true).exec(function(err, produtos){
		if(err) return res.status(500).send({error: err});

		res.status(200).send(produtos);
	});
});

app.get('/produtos/all', function(req, res){

	Produtos.find({}, function(err, produtos){
		if(err) return res.status(500).send({error: err});

		res.status(200).send(produtos);
	});
});

app.get('/produtos/categoria/:categoria', function(req, res){

	console.log("Buscando por categoria");
	var idCategoria = req.params.categoria;
	// res.status(200).json({messagen: "Produtos com a categoria: " + idCategoria});	

	Produtos.find({categoria: idCategoria}, function(err, produtos){
		if(err) return res.status(500).send({error: err});

		res.status(200).send(produtos);
	});
});

app.get('/produtos/:id', function(req, res){

	console.log("Buscando por ID");
	var idProduto = req.params.id;

	Produtos.findById(idProduto, function(err, produto){
		if(err) return res.status(500).send({error: err});

		if(!produto)
			return res.status(404).send({message: "Nenhum produto encontrado"});	
		
		res.status(200).send(produto);
	});
});

app.post('/produtos', function(req, res){

	var newProduto = Produtos({
		  codigo: req.body.codigo,
		  nome: req.body.nome,
		  descricao: req.body.descricao || '',
		  unidadeMedida: req.body.unidadeMedida || 'kg',
		  valorPadrao: req.body.valorPadrao,
		  valorEspecial: req.body.valorEspecial || '',
		  categoria: req.body.categoria,
		  criadoEm: new Date(),
		  ativo: req.body.ativo || true
	});

	newProduto.save(function(err){
		if(err) return res.status(500).send({error: err});

		res.status(200).send({message: "Novo produto cadastrado", produto: newProduto});
	});
});

app.put('/produtos/:id', function(req, res){
	res.status(501).send({message: 'Unimplemented'});
});

app.delete('/produtos/:id', function(req, res){

	var idProduto = req.params.id;
	Produtos.findByIdAndUpdate(idProduto, { ativo: 'false' }, function(err, produto) {

		if(err) return res.status(500).send({error: 'Erro ao remover produto', message: err.message});

		res.status(200).send({message: 'Produto removido', produto: produto});
	});
});

//Apaga TODAS os produtos da base de dados. SEM PENSAR DUAS VEZES. CUIDADO
app.delete('/produtos/erase/:sure', function(req, res){

	var isSure = req.params.sure;
	console.log("APENAS TESTES >> Não estará em produção!");

	if(isSure == 'true'){
		Produtos.remove({}, function(err){

			if(err) return res.status(500).send({error: 'Erro ao remover produto', message: err.message});

			return res.status(200).send({message: "Todos os produtos foram deletados!"});
		});
	}else{
		res.status(400).send({message: "You almost made a mess"});
	}
});

app.listen(8000);