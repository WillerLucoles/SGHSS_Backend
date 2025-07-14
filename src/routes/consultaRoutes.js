// src/routes/consultaRoutes.js
import express from 'express';
import consultaController from '../controllers/consultaController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import authorize from '../middlewares/authorize.js';
import validate from '../middlewares/validate.js';
import { agendarConsultaSchema } from '../validators/consultaValidator.js';

const router = express.Router();


router.post(
  '/',
  authMiddleware,
  authorize(['PACIENTE']),
  validate(agendarConsultaSchema),
  consultaController.agendar
);

router.patch(
  '/:id/cancelar',
  authMiddleware,
  authorize(['PACIENTE']), // Apenas um paciente pode tentar cancelar
  validate(cancelarConsultaSchema),
  consultaController.cancelar
);

export default router;