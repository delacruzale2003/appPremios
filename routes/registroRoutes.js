const express = require('express');
const router = express.Router();
const registroController = require('../controllers/registroController');

router.get('/cliente/:idCliente', registroController.getRegistroPorCliente); // ← primero
router.get('/', registroController.getRegistros);
router.get('/:id', registroController.getRegistroById); // ← último

module.exports = router;
