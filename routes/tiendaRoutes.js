const express = require('express');
const router = express.Router();
const tiendaController = require('../controllers/tiendaController');

// Crear una tienda
router.post('/crear', tiendaController.crearTienda);

// Obtener tienda por ID
router.get('/:id', tiendaController.getTiendaById);

module.exports = router;