const mongoose = require('mongoose');

const TiendaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  premios_disponibles: { type: Number, required: true, default: 0 },
  campaña: { type: String, required: true } // ← identifica a qué campaña pertenece la tienda
});

module.exports = mongoose.model('Tienda', TiendaSchema);
