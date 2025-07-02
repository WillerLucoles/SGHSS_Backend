// src/routes/profissionalRoutes.js

import express from 'express';
import profissionalController from '../controllers/profissionalController.js';
import validate from '../middlewares/validate.js';
import {
  criarProfissionalSchema,
  atualizarProfissionalSchema,
} from '../validators/profissionalValidator.js';

// --- CONFIGURAÇÃO DO ROTEADOR ---
const router = express.Router();


router.post(
  '/',
  validate(criarProfissionalSchema),
  profissionalController.criar
);
router.put(
  '/:id',
  validate(criarProfissionalSchema),
  profissionalController.atualizar
);
router.patch(
  '/:id',
  validate(atualizarProfissionalSchema),
  profissionalController.atualizar
);
router.get('/:id', profissionalController.buscarPorId);
router.get('/', profissionalController.listarTodos);
router.delete('/:id', profissionalController.deletar);


export default router;