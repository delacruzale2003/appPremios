const mongoose = require('mongoose');

const RegistroSchema = new mongoose.Schema({
    cliente_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Cliente',  // Relación con el modelo Cliente
        required: true 
    },
    tienda_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Tienda',   // Relación con el modelo Tienda
        required: true 
    },
    premio_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Premio',   // Relación con el modelo Premio
        required: true 
    },
    foto: { 
        type: String,  // Almacena la URL o ruta de la foto del voucher
        required: true 
    },
    fecha_registro: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Registro', RegistroSchema);