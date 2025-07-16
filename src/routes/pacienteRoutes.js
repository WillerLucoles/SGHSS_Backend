// src/routes/pacienteRoutes.js

import express from 'express';
import pacienteController from '../controllers/pacienteController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import authorize from '../middlewares/authorize.js';
import validate from '../middlewares/validate.js';
import { registrarPacienteSchema, atualizarMeuPerfilSchema } from '../validators/pacienteValidator.js';

const router = express.Router();

// Rota pública para registro
router.post(
    '/register',
    validate(registrarPacienteSchema),
    pacienteController.registrar
  );

// Rota protegida para listar todos os pacientes
router.get('/', authMiddleware, pacienteController.listarTodos);
router.get('/me',authMiddleware, authorize(['PACIENTE']), pacienteController.buscarMeuPerfil);
router.put('/me',authMiddleware, authorize(['PACIENTE']), validate(atualizarMeuPerfilSchema), pacienteController.atualizarMeuPerfil);
router.get('/me/consultas', authMiddleware, authorize(['PACIENTE']), pacienteController.listarMinhasConsultas);
router.get('/:id', authMiddleware, authorize(['ADMINISTRADOR', 'PROFISSIONAL']), pacienteController.buscarPorId);
router.put('/:id', authMiddleware, pacienteController.atualizar);
router.delete('/:id', authMiddleware, pacienteController.deletar);
router.get(
  '/:id/historico-clinico',
  authMiddleware,
  authorize(['PROFISSIONAL', 'ADMINISTRADOR']),
  pacienteController.buscarHistoricoClinico
);

export default router;