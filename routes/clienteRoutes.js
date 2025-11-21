const express = require('express');
const { body, query } = require('express-validator');
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

// Registro de clientes
router.post('/clientes', validarCliente, clienteController.registrarCliente); 
router.post('/clientesr', clienteController.registrarCliente);

// Consulta de clientes
router.get('/clientes', 
    query('limit').optional().isInt({ min: 1 }).withMessage('El límite debe ser un número entero positivo'),
    clienteController.getClientes
);

// ✅ Nuevo endpoint para exportar todos los clientes (sin límite)
router.get('/clientes/export', clienteController.exportClientes);

router.get('/actividad-fanta-completa', clienteController.getActividadFantaCompleta);

router.get('/pendientes', clienteController.getClientesPendientes);
router.get('/cancelados', clienteController.getClientesCancelados);

// ✅ Nuevo endpoint para notificación FANTA
router.get('/notificacion-fanta', clienteController.notificacionFanta);

// Esta debe ir al final para evitar conflictos con rutas anteriores
router.get('/:id', clienteController.getClientePorId);

module.exports = router;
