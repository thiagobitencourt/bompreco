var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/bompreco');

var Schema = mongoose.Schema;

var categoriaSchema = new Schema({
  codigo: { type: String, required: true, unique: true },
  categoria: { type: String, required: true, unique: true },
  produto: [{type: Schema.ObjectId, ref: 'Produto'}],
  ativa: Boolean
});

var Categoria = mongoose.model('Categoria', categoriaSchema);

// make this available to our users in our Node applications
module.exports = Categoria;