const mongoose = require('mongoose');

const RegistroSchema = new mongoose.Schema({
  cliente_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true,
    unique: true // Un cliente solo puede tener un registro por campaña
  },
  tienda_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tienda',
    required: true
  },
  premio_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Premio',
    required: false, // <--- CAMBIO: Ahora permite estar vacío
    default: null
  },
  foto: {
    type: String,
    required: false,
    default: ""
  },
  fecha_registro: {
    type: Date,
    default: Date.now
  },
  campaña: {
    type: String,
    required: true,
    index: true
  },
  // NUEVO CAMPO: Ayuda mucho a filtrar rápido en el panel de control
  esGanador: {
    type: Boolean,
    default: true,
    index: true
  }
});

module.exports = mongoose.model('Registro', RegistroSchema);