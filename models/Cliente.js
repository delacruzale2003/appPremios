const mongoose = require('mongoose');

const ClienteSchema = new mongoose.Schema({
  dni: { type: String, required: true },
  nombre: { type: String, required: true },
  telefono: { type: String, required: true },
  tienda: { type: mongoose.Schema.Types.ObjectId, ref: 'Tienda' },
  fecha_registro: { type: Date, default: Date.now },
  foto: { type: String },

  // NUEVOS CAMPOS
  isValid: { type: Boolean, default: true },       // aparece en el panel si es true
  tienePremio: { type: Boolean, default: false },   // se vuelve true al entregar premio
  mensaje: { type: String, default: '' },           // opcional: mensaje de rechazo
});

module.exports = mongoose.model('Cliente', ClienteSchema);
