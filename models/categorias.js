var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/bompreco');

var Schema = mongoose.Schema;
var relationship = require("mongoose-relationship");

var categoriaSchema = new Schema({
  codigo: { type: String, required: true, unique: true },
  categoria: { type: String, required: true, unique: true }
});

// categoriaSchema.plugin(relationship, { relationshipPathName:'sessao' });
var Categoria = mongoose.model('Categoria', categoriaSchema);

// make this available to our users in our Node applications
module.exports = Categoria;

// 55cbe941cf4b058717044db4
// 55cbe9a2cf4b058717044db9