'use strict';

var mongoose = require('mongoose');
var bcrypt = require('bcrypt'),
    SALT_WORK_FACTOR = 10;

var Schema = mongoose.Schema;

var sessaoSchema = new Schema({
  nome: { type: String, required: true, unique: true, index: true },
  hash: { type: String },
  categorias:
  	[{
    	_id : { type:Schema.ObjectId, ref:"Categoria"},
    	tempo : String
  	}],
  produtos:
  	[{
      categoria: {type:Schema.ObjectId, ref: "Categoria"},
		  produto: {type:Schema.ObjectId, ref: "Produto"}
    }],
  padrao: Boolean
});

sessaoSchema.pre('save', function(next) {
    var sessao = this;

    var uid = function(len) {

      var _randomInt = function(min, max) {
    		return Math.floor(Math.random() * (max - min + 1)) + min;
    	}

  		var buf = []
      	, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      	, charlen = chars.length;

  		for (var i = 0; i < len; ++i) {
  			buf.push(chars[_randomInt(0, charlen - 1)]);
  		}
  		return buf.join('');
  	}

    // only hash the password if it has been modified (or is new)
    if (sessao.isModified('categorias') ||
        sessao.isModified('produtos') ||
        sessao.isModified('nome')){
      // generate a salt
      bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
          if (err){
            console.log('Erro ao gerar salt para sessão');
            return next('Erro ao gerar salt para sessão');
          };

          // hash the password using our new salt
          bcrypt.hash(uid(10), salt, function(err, hash) {
            if (err){
              console.log('Erro ao gerar hash para sessão: ' + err);
              return next('Erro ao gerar hash para sessão');
            };

            console.log("Hash Created..." + hash);
            // override the cleartext password with the hashed one
            sessao.hash = hash;
            return next();
          });
      });
    }else{
      console.log("Não precisa de HASH");
      return next();
    }
});

var Sessao = mongoose.model('Sessao', sessaoSchema);

// make this available to our users in our Node applications
module.exports = Sessao;
