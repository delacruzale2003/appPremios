const mongoose = require('mongoose');

const ClienteSchema = new mongoose.Schema({
    dni: { type: String, required: true  },
    nombre: { type: String, required: true },
    telefono: { type: String, required: true },
    tienda: { type: mongoose.Schema.Types.ObjectId, ref: 'Tienda' },  // El cliente se asocia con una tienda
    fecha_registro: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Cliente', ClienteSchema);