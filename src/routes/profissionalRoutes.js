const express = require('express');
const profissionalController = require('../controllers/profissionalController');
const validate = require('../middlewares/validate');
const {
  criarProfissionalSchema,
  atualizarProfissionalSchema
} = require('../validators/profissionalValidator');

const router = express.Router();

router.post('/', validate(criarProfissionalSchema), profissionalController.criar);
router.put('/:id', validate(criarProfissionalSchema), profissionalController.atualizar);
router.patch(
  '/:id',
  validate(atualizarProfissionalSchema),
  profissionalController.atualizar
);
router.get('/:id', profissionalController.buscarPorId);
router.get('/', profissionalController.listarTodos);
router.delete('/:id', profissionalController.deletar);

module.exports = router;
