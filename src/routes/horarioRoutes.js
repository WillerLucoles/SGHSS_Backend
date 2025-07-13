// src/routes/horarioRoutes.js
import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import authorize from '../middlewares/authorize.js';
import validate from '../middlewares/validate.js';
import { criarGradeSemanalSchema } from '../validators/horarioValidator.js';
import horarioController from '../controllers/horarioController.js';

const router = express.Router();

router.post(
  '/grade-semanal',
  authMiddleware,
  authorize(['PROFISSIONAL']),
  validate(criarGradeSemanalSchema),
  horarioController.definirGradeSemanal
);


export default router;