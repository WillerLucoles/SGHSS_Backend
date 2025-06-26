// src/routes/profissionalRoutes.js
const express = require('express');
const router = express.Router();
const profissionalController = require('../controllers/profissionalController');
const { criarProfissionalSchema, atualizarProfissionalSchema } = require('../validators/profissionalValidator');



router.get('/', profissionalController.listarTodos);
router.get('/:id', profissionalController.buscarPorId);
router.post('/', validate(criarProfissionalSchema), profissionalController.criar);
router.put('/:id', validate(atualizarProfissionalSchema), profissionalController.atualizar);
router.delete('/:id', profissionalController.deletar);

module.exports = router;
