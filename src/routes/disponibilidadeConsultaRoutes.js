// src/routes/disponibilidadeConsultaRoutes.js

import express from 'express';
import validate from '../middlewares/validate.js';
import { criarDisponibilidadeConsultaSchema } from '../validators/disponibilidadeConsultaValidator.js';
import disponibilidadeConsultaController from '../controllers/disponibilidadeConsultaController.js';

// --- CONFIGURAÇÃO DO ROTEADOR ---
const router = express.Router();

router.post(
  '/',
  validate(criarDisponibilidadeConsultaSchema),
  disponibilidadeConsultaController.criar
);
router.get(
  '/:profissionalId',
  disponibilidadeConsultaController.listarPorProfissional
);


export default router;