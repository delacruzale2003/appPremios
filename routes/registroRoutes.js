const express = require('express');
const router = express.Router();
const registroController = require('../controllers/registroController'); // Asegúrate de tener el controlador correcto

// Ruta para obtener todos los registros (con los detalles relacionados de Cliente, Tienda, Premio)
router.get('/', registroController.getRegistros);

// Ruta para registrar un nuevo registro (cuando un cliente gana un premio)
router.post('/', registroController.registrarRegistro);

// Aquí puedes agregar más rutas según sea necesario, por ejemplo, para eliminar registros, actualizar, etc.

// Exportar las rutas
module.exports = router;
