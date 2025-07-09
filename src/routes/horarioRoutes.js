// src/routes/horarioRoutes.js
import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import authorize from '../middlewares/authorize.js';
import validate from '../middlewares/validate.js';
import { criarHorarioPadraoSchema, gerarAgendaSchema } from '../validators/horarioValidator.js';
import horarioController from '../controllers/horarioController.js';

const router = express.Router();

router.post(
  '/padrao',
  authMiddleware,
  authorize(['PROFISSIONAL']),
  validate(criarHorarioPadraoSchema),
  horarioController.definirHorario
);

router.post(
  '/gerar-agenda',
  authMiddleware,
  authorize(['PROFISSIONAL']),
  validate(gerarAgendaSchema),
  horarioController.gerarAgenda
);

export default router;