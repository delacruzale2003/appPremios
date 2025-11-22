const mongoose = require('mongoose');

const TiendaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  premios_disponibles: { type: Number, required: true, default: 0 },
  campaña: { type: String, required: true }
});

// Índice recomendado
TiendaSchema.index({ campaña: 1 });

module.exports = mongoose.model('Tienda', TiendaSchema);
