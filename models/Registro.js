const mongoose = require('mongoose');

const RegistroSchema = new mongoose.Schema({
  cliente_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true,
    unique: true
  },
  tienda_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tienda',
    required: true
  },
  premio_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Premio',
    required: false,
    default: null
  },
  foto: {
    type: String,
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
  esGanador: {
    type: Boolean,
    default: true,
    index: true
  }
});

// ✅ Evita errores si el modelo ya fue registrado
module.exports = mongoose.models.Registro || mongoose.model('Registro', RegistroSchema);
