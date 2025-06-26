// src/routes/consultaRoutes.js
const express = require('express');
const router = express.Router();
const consultaController = require('../controllers/consultaController');
const { criarConsultaSchema, atualizarConsultaSchema } = require('../validators/consultaValidator');



router.get('/', consultaController.listarTodos);
router.get('/:id', consultaController.buscarPorId);
router.post('/', validate(criarConsultaSchema), consultaController.criar);
router.put('/:id', validate(atualizarConsultaSchema), consultaController.atualizar);
router.delete('/:id', consultaController.deletar);
router.patch('/:id/cancelar', consultaController.cancelar);


module.exports = router;
