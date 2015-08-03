var mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost/bompreco');

var Schema = mongoose.Schema;
var relationship = require("mongoose-relationship");

var produtoSchema = new Schema({
  codigo: { type: String, required: true, unique: true },
  nome: { type: String, required: true, unique: true },
  descricao: String,
  unidadeMedida: {type: String, required: true},
  valorPadrao: {type: String, required: true},
  valorEspecial: { type : Array , "default" : [] },
  criadoEm: Date,
  // categoria: { type:Schema.ObjectId, required: true, ref:"Categoria", childPath:"produto" },
  categoria: { type:Schema.ObjectId, required: true, ref:"Categoria"},
  ativo: Boolean
});

// produtoSchema.plugin(relationship, { relationshipPathName:'categoria' });
var Produto = mongoose.model('Produto', produtoSchema);

// make this available to our users in our Node applications
module.exports = Produto;

/*
//Exemplo de POST com um novo produto
    {
      "codigo": "sf87",
      "nome": "Vinho Tinto",
      "descricao": "Vinho tinto de primeira qualidade",
      "unidadeMedida": "lt",
      "valorPadrao": "156,44",
      "criadoEm": "2015-08-01T00:37:10.512Z",
      "categoria": "55bc2cd804bdc8ae2ce030c4",
      "ativo": true,
      "valorEspecial": [
        {"segunda-feira":"66,12"}, {"sexta-feira":"125,52"}
      ]
    }
*/