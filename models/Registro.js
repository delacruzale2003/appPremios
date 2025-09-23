// models/Registro.js
const mongoose = require('mongoose');

const RegistroSchema = new mongoose.Schema({
  cliente_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true
  },
  tienda_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tienda',
    required: true
  },
  premio_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Premio',
    required: true
  },
  foto: {
    type: String,
    // ya no es obligatorio y por defecto vacío
    required: false,
    default: ""
  },
  fecha_registro: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Registro', RegistroSchema);
