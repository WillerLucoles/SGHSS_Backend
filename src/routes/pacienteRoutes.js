const express = require('express');
const consultaController = require('../controllers/consultaController');
const validate = require('../middlewares/validate');
const {
  criarConsultaSchema,
  atualizarConsultaSchema
} = require('../validators/consultaValidator');

const router = express.Router();

router.post('/', validate(criarConsultaSchema), consultaController.criar);
router.put('/:id', validate(criarConsultaSchema), consultaController.atualizar);
router.patch(
  '/:id',
  validate(atualizarConsultaSchema),
  consultaController.atualizar
);
router.get('/', consultaController.listarTodos);
router.get('/:id', consultaController.buscarPorId);
router.patch('/:id/cancelar', consultaController.cancelar);
router.delete('/:id', consultaController.deletar);

module.exports = router;
