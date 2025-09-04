const mongoose = require('mongoose');

const PremioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    stock_inicial: { type: Number, required: true },
    stock_disponible: { type: Number, required: true },
    id_tienda: { type: mongoose.Schema.Types.ObjectId, ref: 'Tienda', required: true }
});

module.exports = mongoose.model('Premio', PremioSchema);
