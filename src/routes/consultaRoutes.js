// src/routes/consultaRoutes.js
const express = require('express');
const router = express.Router();
const consultaController = require('../controllers/consultaController');

router.get('/', consultaController.listarTodos);
router.get('/:id', consultaController.buscarPorId);
router.post('/', consultaController.criar);
router.put('/:id', consultaController.atualizar);
router.delete('/:id', consultaController.deletar);
router.patch('/:id/cancelar', consultaController.cancelar);


module.exports = router;
