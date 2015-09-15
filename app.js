var express = require('express'); 
var bodyParser = require('body-parser');

var RouterApi = require('./server/controllers/routeapi');
var RouterTv = require('./server/controllers/routetv');

var app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(express.static('web/'));
app.get('/', function(req, res){
	return res.sendfile('web/index.html');
});

app.get('/login', function(req, res){
	return res.sendfile('web/login.html');
});

app.get('/logout', function(req, res){
	return res.redirect('/login.html');
});

app.get('/tv', function(req, res){
	res.sendfile('web/tvindex.html');
});

app.use('/api', new RouterApi());
app.use('/tv', new RouterTv());

app.listen(8000);