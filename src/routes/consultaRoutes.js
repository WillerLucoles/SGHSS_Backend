// src/routes/consultaRoutes.js

import express from 'express';
import consultaController from '../controllers/consultaController.js';
import validate from '../middlewares/validate.js';
import { criarConsultaSchema, atualizarConsultaSchema } from '../validators/consultaValidator.js';

// --- CONFIGURAÇÃO DO ROTEADOR ---
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



export default router;