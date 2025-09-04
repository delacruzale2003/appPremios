const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

// Asegúrate de que las funciones de tu controlador sean correctas y existan
router.post('/registrar', clienteController.registrarCliente); // registrarCliente debe ser una función
router.get('/clientes', clienteController.getClientes);  // getClientes debe ser una función

module.exports = router;