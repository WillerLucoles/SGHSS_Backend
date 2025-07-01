// src/routes/pacienteRoutes.js
const express = require('express');
const validate = require('../middlewares/validate');
const pacienteController = require('../controllers/pacienteController');
const {
  criarPacienteSchema,
  atualizarPacienteSchema
} = require('../validators/pacienteValidator');

const router = express.Router();

router.get('/', pacienteController.listarTodos);
router.get('/:id', pacienteController.buscarPorId);

router.post(
  '/',
  validate(criarPacienteSchema),
  pacienteController.criar
);

router.put(
  '/:id',
  validate(criarPacienteSchema),
  pacienteController.atualizar
);

router.patch(
  '/:id',
  validate(atualizarPacienteSchema),
  pacienteController.atualizar
);

router.delete('/:id', pacienteController.deletar);

module.exports = router;
