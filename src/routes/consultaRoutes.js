// src/routes/consultaRoutes.js
import express from 'express';
import consultaController from '../controllers/consultaController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import authorize from '../middlewares/authorize.js';
import validate from '../middlewares/validate.js';
import { agendarConsultaSchema, cancelarConsultaSchema, agendarPeloProfissionalSchema } from '../validators/consultaValidator.js';
import { salvarRegistroSchema } from '../validators/registroClinicoValidator.js';

const router = express.Router();


router.post(
  '/',
  authMiddleware,
  authorize(['PACIENTE']),
  validate(agendarConsultaSchema),
  consultaController.agendar
);

router.post(
  '/agendamento-por-profissional',
  authMiddleware,
  authorize(['PROFISSIONAL']),
  validate(agendarPeloProfissionalSchema),
  consultaController.agendarPeloProfissional
);

router.patch(
  '/:id/cancelamento-consulta-via-paciente',
  authMiddleware,
  authorize(['PACIENTE']),
  validate(cancelarConsultaSchema),
  consultaController.cancelarPeloPaciente
);


router.patch(
  '/:id/cancelamento-consulta-via-profissional',
  authMiddleware,
  authorize(['PROFISSIONAL']),
  validate(cancelarConsultaSchema),
  consultaController.cancelarPeloProfissional
);

router.put(
  '/:id/registro-clinico',
  authMiddleware,
  authorize(['PROFISSIONAL']),
  validate(salvarRegistroSchema),
  consultaController.salvarRegistroClinico
);

export default router;