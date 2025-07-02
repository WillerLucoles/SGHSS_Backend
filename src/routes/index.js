// src/routes/index.js

import express from 'express';
import pacienteRoutes from './pacienteRoutes.js';
import consultaRoutes from './consultaRoutes.js';
import profissionalRoutes from './profissionalRoutes.js';
import disponibilidadeConsultaRoutes from './disponibilidadeConsultaRoutes.js';
import usuarioRoutes from './usuarioRoutes.js';

const router = express.Router();

router.use('/usuarios', usuarioRoutes);
router.use('/consultas', consultaRoutes);
router.use('/pacientes', pacienteRoutes);
router.use('/profissionais', profissionalRoutes);
router.use('/disponibilidades', disponibilidadeConsultaRoutes);

export default router;