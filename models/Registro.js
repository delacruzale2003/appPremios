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
    required: true
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
    required: true // ← identifica a qué proyecto pertenece el registro
  }
});

// Si quieres, también puedes definirlo como índice:
// RegistroSchema.index({ cliente_id: 1 }, { unique: true });

module.exports = mongoose.model('Registro', RegistroSchema);
