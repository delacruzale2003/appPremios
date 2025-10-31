const express = require('express');
const router = express.Router();
const registroController = require('../controllers/registroController');

router.get('/cliente/:idCliente', registroController.getRegistroPorCliente); // ← primero
router.get('/completos', registroController.getRegistrosCompletos); // ✅ nuevo endpoint
router.get('/', registroController.getRegistros);
router.get('/:id', registroController.getRegistroById); // ← último

// 🔥 Ruta para eliminar todos los registros
router.delete('/eliminar-todos', registroController.eliminarTodosLosRegistros);

module.exports = router;
