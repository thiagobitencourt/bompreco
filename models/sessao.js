var mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost/bompreco');

var Schema = mongoose.Schema;

var sessaoSchema = new Schema({
  nome: { type: String, required: true, unique: true },
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

var Sessao = mongoose.model('Sessao', sessaoSchema);

// make this available to our users in our Node applications
module.exports = Sessao;