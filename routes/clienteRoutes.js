const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

// ---------------------------------------------------------
// RUTAS DE CONSULTA Y REPORTES
// ---------------------------------------------------------

// 1. Obtener lista de clientes (Paginado)
// Frontend usa: GET /cliente/clientes?limit=10&campaña=...
router.get('/clientes', clienteController.getClientes);

// 2. Exportar clientes (Compatibilidad)
// Reutilizamos getClientes. El frontend puede pedir ?limit=10000 para exportar todo.
router.get('/clientes/export', clienteController.getClientes);

// 3. Reporte de Actividad (El reemplazo de "Fanta Completa")
// Mantiene la URL vieja para que tu frontend no se rompa, pero usa la lógica nueva.
router.get('/actividad-fanta-completa', clienteController.getActividadCompleta);

// También agregamos una ruta con nombre más limpio para el futuro
router.get('/reporte/actividad', clienteController.getActividadCompleta);

// 4. Obtener cliente específico por ID
// (Siempre debe ir al final para no chocar con las otras rutas)
router.get('/:id', clienteController.getClientePorId);

// ---------------------------------------------------------
// RUTAS ELIMINADAS / MOVIDAS
// ---------------------------------------------------------
// ❌ POST /clientes -> ELIMINADO. (Ahora se usa POST /premio/entregar)
// ❌ GET /pendientes -> ELIMINADO. (Usa filtros en el reporte general)
// ❌ GET /notificacion-fanta -> ELIMINADO. (Ya no es necesario polling)

module.exports = router;