global.__base = __dirname + '/server/';

var mongoose = require('mongoose');
var express = require('express'); 
var bodyParser = require('body-parser');
var session = require('client-sessions');
var LoggingSystem = require('./server/utils/log');
var logger = require('winston');
var args = process.argv;

var RouterApi = require('./server/controllers/routeapi');
var RouterTv = require('./server/controllers/routetv');

var Usuario = require(__base + 'models/users');

mongoose.connect('mongodb://localhost/bompreco', null, function(err){

	if(err)
		return console.error("DB error : " + err);

	var logDebug = false;
	if(args.indexOf('--debug') > -1)
		logDebug = true;
	var loggingErrors = LoggingSystem.configure(logDebug);
	if(loggingErrors){
		return console.error(loggingErrors);		
	}
	logger.info("Logger online.");

	var app = express();

	app.use(bodyParser.urlencoded({extended: true}));
	app.use(bodyParser.json());

	// Use this configuration.
	app.use(session({
	  cookieName: 'session',
	  secret: 'MySuperSecretSessionPass',
	  duration: 30 * 60 * 1000,
	  activeDuration: 5 * 60 * 1000
	}));

	app.post('/login', function(req, res){

		Usuario.findOne({username: req.body.username}, function(err, user){

			if(err){
				return res.status(500).send({message: "Erro ao fazer login!"});
			}

			if(user){

				user.comparePassword(req.body.password, function(err, passOk){

					if(err){
						return res.status(500).send({message: "Erro ao fazer login!"});
					}

					if(passOk){
						req.session.userData = user.clean();
						return res.status(200).send(user.clean());
					}else{
						return res.status(401).send({message: "Senha inválida"});
					}
				});

			}else{
				return res.status(401).send({message: "Usuário inválido"});
			}
		});

	});

	app.get('/logout', function(req, res){
		delete req.session.userData;
		return res.redirect('/login');
	});

	app.get('/session', function(req, res){
		if(req.session && req.session.userData){

			Usuario.findOne({username: req.session.userData.username}, function(err, user){

				if(err){
					return res.status(500).send({message: "Erro ao fazer login!"});
				}

				if(user){
					return res.send(user.clean());
				}else{
					delete req.session.userData;
					return res.status(403).send({message: "Unauthorized"});		
				}
			});

		}else{
			delete req.session.userData;
			return res.status(403).send({message: "Unauthorized"});
		}
	});

	var isSessionAuthorized = function(req,res,next){
		//check session
		// ...
		if(req.session && req.session.userData){
			console.log("HAS SESSION - " + JSON.stringify(req.session));
			return res.redirect('/web');
		}

		console.log("SEM SESSÃO");
		return res.redirect('/login');
	};

	var hasSession = function(req, res, next){
		if(req.session && req.session.userData)
			return next();

		return res.redirect('/login');
	};

	app.get('/', isSessionAuthorized);

	app.use('/login', function(req, res, next){
		if(req.session && req.session.userData)
			return res.redirect('/web');

		return next();
	});
	app.use('/login', express.static('web/public/login'));

	app.use('/tv', express.static('web/public/tv'));
	app.use('/images', express.static('web/images/'));

	app.use('/web', hasSession);
	app.use('/web', express.static('web/private'));

	app.use('/api', function(req, res, next){
		if(req.session && req.session.userData){
			return next();
		}

		return res.status(403).send({message: "Unauthorized"});
	});
	app.use('/api', new RouterApi());

	app.use('/tv', new RouterTv());

	app.listen(8000);

});