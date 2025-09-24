const express = require('express');
const router = express.Router();
const premioController = require('../controllers/premioController');

// Ruta para crear un nuevo premio
router.post('/', premioController.crearPremio);

// Ruta para entregar un premio
router.post('/entregar', premioController.entregarPremio);

// Ruta para obtener los premios por ID de tienda
router.get('/:id_tienda', premioController.getPremiosByIdTienda);

// Ruta para actualizar un premio
router.put('/:id', premioController.actualizarPremio);
// Ruta para cancelar un cliente
router.post('/cancelar', premioController.cancelarCliente);
// Exportar las rutas
module.exports = router;