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

// --- ROTAS DE PERFIL DO PROFISSIONAL LOGADO ('/me') ---
router.get(
  '/me',
  authMiddleware,
  authorize(['PROFISSIONAL']), // Apenas um profissional pode ver o seu próprio perfil
  profissionalController.buscarMeuPerfil
);

router.put(
  '/me',
  authMiddleware,
  authorize(['PROFISSIONAL']), // Apenas um profissional pode atualizar os seus próprios dados
  validate(atualizarProfissionalSchema),
  profissionalController.atualizarMeuPerfil
);

// --- ROTAS ADMINISTRATIVAS ---

// ROTA DE CRIAÇÃO (Apenas para Administradores)
router.post(
  '/',
  authMiddleware,
  authorize(['ADMINISTRADOR']),
  validate(criarProfissionalSchema),
  profissionalController.criar
);

// ROTA DE LEITURA GERAL (Admins e Profissionais podem ver a lista)
router.get(
  '/',
  authMiddleware,
  authorize(['ADMINISTRADOR', 'PROFISSIONAL']),
  profissionalController.listarTodos
);

// ROTA DE LEITURA POR ID (Admins e Profissionais podem ver detalhes)
router.get(
  '/:id',
  authMiddleware,
  authorize(['ADMINISTRADOR', 'PROFISSIONAL']),
  profissionalController.buscarPorId
);

// ROTA DE ATUALIZAÇÃO POR ID (Apenas para Administradores)
router.patch(
  '/:id',
  authMiddleware,
  authorize(['ADMINISTRADOR']),
  validate(atualizarProfissionalSchema),
  profissionalController.atualizar
);

// ROTA DE EXCLUSÃO (Apenas para Administradores)
router.delete(
  '/:id',
  authMiddleware,
  authorize(['ADMINISTRADOR']),
  profissionalController.deletar
);

export default router;