const mongoose = require('mongoose');

const RegistroSchema = new mongoose.Schema({
  cliente_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true,
    unique: true // Un cliente = un registro por campaña
  },
  tienda_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tienda',
    required: true
  },
  premio_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Premio',
    required: false, // <--- ¡AHORA SÍ! Permite guardar sin premio
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
    required: false,
    index: true
  },
  // NUEVO CAMPO: Nos ayuda a diferenciar ganadores de perdedores rapidísimo
  esGanador: {
    type: Boolean,
    default: true,
    index: true
  }
});

// Evita el error "OverwriteModelError"
module.exports = mongoose.models.Registro || mongoose.model('Registro', RegistroSchema);