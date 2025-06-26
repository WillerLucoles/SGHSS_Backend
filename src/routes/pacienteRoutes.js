// src/routes/pacienteRoutes.js
const express = require('express');
const router = express.Router();
const pacienteController = require('../controllers/pacienteController');
const validate = require('../middlewares/validate');
const { criarPacienteSchema, atualizarPacienteSchema } = require('../validators/pacienteValidator');




router.get('/', pacienteController.listarTodos);
router.get('/:id', pacienteController.buscarPorId);
router.post('/', validate(criarPacienteSchema), pacienteController.criar);
router.put('/:id', validate(atualizarPacienteSchema), pacienteController.atualizar);
router.delete('/:id', pacienteController.deletar);


module.exports = router;
