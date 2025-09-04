const express = require('express');
const router = express.Router();
const premioController = require('../controllers/premioController');

// Ruta para crear un premio
router.post('/crear', premioController.crearPremio);
router.put('/entregar', premioController.entregarPremio);
router.get('/tienda/:id_tienda', premioController.getPremiosByIdTienda);
module.exports = router;