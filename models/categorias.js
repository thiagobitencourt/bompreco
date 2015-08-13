var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/bompreco');

var Schema = mongoose.Schema;
var relationship = require("mongoose-relationship");

var categoriaSchema = new Schema({
  codigo: { type: String, required: true, unique: true },
  categoria: { type: String, required: true, unique: true },
  // sessao: { type:Schema.ObjectId, required: true, ref:"Sessao", childPath:"categorias" },
  ativa: Boolean
});

// categoriaSchema.plugin(relationship, { relationshipPathName:'sessao' });
var Categoria = mongoose.model('Categoria', categoriaSchema);

// make this available to our users in our Node applications
module.exports = Categoria;
// 55bc2cd804bdc8ae2ce030c4
// 55c188dafd8fede52689d6f0
// 55c18955fb5e782727a23d66
// 55c18abf18d3a233281266fa