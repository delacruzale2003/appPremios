const mongoose = require('mongoose');

const PremioSchema = new mongoose.Schema({
  nombre: { 
    type: String, 
    required: true 
  },
  stock_inicial: { 
    type: Number, 
    required: true 
  },
  stock_disponible: { 
    type: Number, 
    required: true 
  },
  // Usamos 'id_tienda' tal como lo tenías en tu código original
  id_tienda: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tienda', // Debe coincidir con el nombre del modelo en Tienda.js
    required: true 
  },
  campaña: { 
    type: String, 
    required: true 
  }
});

// --- ÍNDICES PARA VELOCIDAD ---
// Ayuda a encontrar rápidamente los premios de una campaña específica
PremioSchema.index({ campaña: 1 });

// Ayuda a la función 'entregarPremio' a encontrar stock > 0 rápidamente
// Este índice compuesto es muy potente para tu lógica de juego:
PremioSchema.index({ id_tienda: 1, campaña: 1, stock_disponible: 1 });

// ✅ PROTECCIÓN CRÍTICA:
// Usamos mongoose.models.Premio para evitar el error "OverwriteModelError"
// IMPORTANTE: El nombre 'Premio' (primer argumento) debe ser EXACTO al ref en Registro.js
module.exports = mongoose.models.Premio || mongoose.model('Premio', PremioSchema);