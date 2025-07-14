// src/routes/horarioRoutes.js
import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import authorize from '../middlewares/authorize.js';
import validate from '../middlewares/validate.js';
import { criarGradeSemanalSchema, criarIndisponibilidadesSchema } from '../validators/horarioValidator.js';
import horarioController from '../controllers/horarioController.js';

const router = express.Router();

router.post(
  '/grade-semanal',
  authMiddleware,
  authorize(['PROFISSIONAL']),
  validate(criarGradeSemanalSchema),
  horarioController.definirGradeSemanal
);

router.post(
  '/indisponibilidades',
  authMiddleware,
  authorize(['PROFISSIONAL']),
  validate(criarIndisponibilidadesSchema),
  horarioController.criarIndisponibilidades
);

router.get(
  '/minha-agenda',
  authMiddleware,
  authorize(['PROFISSIONAL']),
  horarioController.listarMinhaAgenda
);




export default router;