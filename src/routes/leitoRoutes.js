// src/routes/leitoRoutes.js
import express from 'express';
import leitoController from '../controllers/leitoController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import authorize from '../middlewares/authorize.js';
import validate from '../middlewares/validate.js';
import { criarLeitoSchema, atualizarLeitoSchema } from '../validators/leitoValidator.js';

const router = express.Router();

router.get(
  '/status',
  authMiddleware,
  authorize(['ADMINISTRADOR', 'PROFISSIONAL']),
  leitoController.listarStatus
);

// A gestão de leitos é, na sua maioria, administrativa
router.use(authMiddleware, authorize(['ADMINISTRADOR']));

router.post('/', validate(criarLeitoSchema), leitoController.criar);
router.get('/', leitoController.listarTodos);
router.get('/:id', leitoController.buscarPorId);
router.patch('/:id', validate(atualizarLeitoSchema), leitoController.atualizar);
router.delete('/:id', leitoController.deletar);

export default router;