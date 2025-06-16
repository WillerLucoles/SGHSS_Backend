// src/routes/pacienteRoutes.js
const express = require('express');
const router = express.Router();
const pacienteController = require('../controllers/pacienteController');

router.get('/', pacienteController.listarTodos);
router.get('/:id', pacienteController.buscarPorId);
router.post('/', pacienteController.criar);
router.put('/:id', pacienteController.atualizar);
router.delete('/:id', pacienteController.deletar);


module.exports = router;
