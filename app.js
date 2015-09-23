var express = require('express'); 
var bodyParser = require('body-parser');
var session = require('client-sessions');

var RouterApi = require('./server/controllers/routeapi');
var RouterTv = require('./server/controllers/routetv');

var app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Use this configuration.
app.use(session({
  cookieName: 'appSession',
  secret: 'eg[isfd-8yF9-7w2315df{}+Ijsli;;to8',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000
  // httpOnly: true,
  // secure: true,
  // ephemeral: true
}));

app.post('/login', function(req, res){
	console.log(req.body);

	//TODO: Validar usuário na base de dados
	if(req.body.username != "thiago"){
		return res.status(401).send({message: "Usuário inválido"});
	}else if (req.body.password != "thiago"){
		return res.status(401).send({message: "Senha inválida"});
	}else{

		req.appSession.user = {username: "thiago", _id:"12345", nome: "Thiago Bitencourt"};

		var user = {nome: "Thiago Bitencourt"};
		return res.status(200).send(user);
	}
});

app.get('/logout', function(req, res){
	delete req.appSession.user;
	return res.redirect('/login');
});

app.get('/session', function(req, res){
	if(req.appSession && req.appSession.user){
		return res.send(req.appSession.user);
	}else{
		return res.redirect('/login');
	}
});

var isSessionAuthorized = function(req,res,next){
	//check session
	// ...
	if(req.appSession && req.appSession.user){
		console.log("HAS SESSION - " + JSON.stringify(req.appSession));
		return res.redirect('/web');
	}

	return res.redirect('/login');
};

var hasSession = function(req, res, next){
	if(req.appSession && req.appSession.user)
		return next();

	return res.redirect('/login');
};

app.get('/', isSessionAuthorized);

app.use('/login', function(req, res, next){
	if(req.appSession && req.appSession.user)
		return res.redirect('/web');

	return next();
});
app.use('/login', express.static('web/public/login'));

app.use('/tv', express.static('web/public/tv'));
app.use('/images', express.static('web/images/'));

app.use('/web', hasSession);
app.use('/web', express.static('web/private'));

app.use('/api', hasSession);
app.use('/api', new RouterApi());

app.use('/tv', new RouterTv());

app.listen(8000);