const mongoose = require('mongoose');

const ClienteSchema = new mongoose.Schema({
  dni: { type: String, required: true },
  nombre: { type: String, required: true },
  telefono: { type: String, required: true },
  tienda: { type: mongoose.Schema.Types.ObjectId, ref: 'Tienda' },
  fecha_registro: { type: Date, default: Date.now },
  foto: { type: String },
  campaña: { type: String, required: true }, // ← identifica el proyecto
  
  // NUEVOS CAMPOS
  isValid: { type: Boolean, default: true },
  tienePremio: { type: Boolean, default: false },
  mensaje: { type: String, default: '' },
});

// ✅ Índices recomendados
ClienteSchema.index({ campaña: 1 }); // acelera búsquedas por campaña
ClienteSchema.index({ dni: 1, campaña: 1 }, { unique: true }); // evita duplicados de DNI en campaña

module.exports = mongoose.model('Cliente', ClienteSchema);
