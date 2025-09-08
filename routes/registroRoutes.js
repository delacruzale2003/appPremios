const express = require('express');
const router = express.Router();
const registroController = require('../controllers/registroController');

// Obtener todos los registros con detalles relacionados
router.get('/', registroController.getRegistros);



// Obtener un registro específico por su ID
router.get('/:id', registroController.getRegistroById);

router.get('/cliente/:idCliente', registroController.getRegistroPorCliente);

// Exportar las rutas
module.exports = router;
