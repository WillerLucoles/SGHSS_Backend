// src/routes/profissionalRoutes.js

import express from 'express';
import profissionalController from '../controllers/profissionalController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import authorize from '../middlewares/authorize.js';
import validate from '../middlewares/validate.js';
import {
  criarProfissionalSchema,
  atualizarProfissionalSchema,
} from '../validators/profissionalValidator.js';

const router = express.Router();

// --- ROTAS DE CRIAÇÃO ---
router.post('/', authMiddleware, authorize(['ADMINISTRADOR']), validate(criarProfissionalSchema), profissionalController.criar);

// --- ROTAS DE LEITURA ---
router.get('/', authMiddleware, authorize(['ADMINISTRADOR', 'PROFISSIONAL']), profissionalController.listarTodos);

router.get('/:id', authMiddleware, authorize(['ADMINISTRADOR', 'PROFISSIONAL']), profissionalController.buscarPorId);

// --- ROTAS DE ATUALIZAÇÃO ---
router.put( '/:id', authMiddleware, authorize(['ADMINISTRADOR']), validate(criarProfissionalSchema), profissionalController.atualizar);

router.patch( '/:id', authMiddleware, authorize(['ADMINISTRADOR']), validate(atualizarProfissionalSchema), profissionalController.atualizar);

// --- ROTA DE EXCLUSÃO ---
router.delete( '/:id', authMiddleware, authorize(['ADMINISTRADOR']), profissionalController.deletar);

export default router;