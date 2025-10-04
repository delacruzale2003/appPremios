const express = require('express');
const { body, query } = require('express-validator'); // Usar express-validator para validación
const router = express.Router();
const clienteController = require('../controllers/clienteController');

// Validación de datos para registrar un cliente
const validarCliente = [
    body('dni').notEmpty().withMessage('El DNI es obligatorio'),
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('telefono').notEmpty().withMessage('El teléfono es obligatorio'),
    body('tienda').notEmpty().withMessage('La tienda es obligatoria'),
    body('foto').notEmpty().withMessage('La foto es obligatoria'),
];

// Ruta para registrar un cliente con validación de datos
router.post('/clientes', validarCliente, clienteController.registrarCliente); 
// Ruta alternativa sin validación para campañas sin tienda ni foto
router.post('/clientesr', clienteController.registrarCliente);

// Ruta para obtener los clientes con soporte para límite personalizado en la query
router.get('/clientes', 
    query('limit').optional().isInt({ min: 1 }).withMessage('El límite debe ser un número entero positivo'),
    clienteController.getClientes
);

router.get('/pendientes', clienteController.getClientesPendientes);
router.get('/cancelados', clienteController.getClientesCancelados);
router.get('/:id', clienteController.getClientePorId); // ← esta debe ir al final


module.exports = router;
