const express = require('express');
const router = express.Router();
const tiendaController = require('../controllers/tiendaController');

// Ruta para obtener todas las tiendas
router.get('/', tiendaController.getTiendas);

// Ruta para crear una nueva tienda
router.post('/', tiendaController.crearTienda);

// Ruta para actualizar una tienda
router.put('/:id', tiendaController.actualizarTienda);

// Ruta para eliminar una tienda
router.delete('/:id', tiendaController.eliminarTienda);

module.exports = router;