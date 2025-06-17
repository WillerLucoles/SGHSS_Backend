// src/routes/profissionalRoutes.js
const express = require('express');
const router = express.Router();
const profissionalController = require('../controllers/profissionalController');

router.get('/', profissionalController.listarTodos);
router.get('/:id', profissionalController.buscarPorId);
router.post('/', profissionalController.criar);
router.put('/:id', profissionalController.atualizar);
router.delete('/:id', profissionalController.deletar);

module.exports = router;
