// src/routes/index.js

import express from 'express';
import pacienteRoutes from './pacienteRoutes.js';
import consultaRoutes from './consultaRoutes.js';
import profissionalRoutes from './profissionalRoutes.js';
import usuarioRoutes from './usuarioRoutes.js';
import horarioRoutes from './horarioRoutes.js';
import quartoRoutes from './quartoRoutes.js';

const router = express.Router();

router.use('/usuarios', usuarioRoutes);
router.use('/consultas', consultaRoutes);
router.use('/pacientes', pacienteRoutes);
router.use('/profissionais', profissionalRoutes);
router.use('/horarios', horarioRoutes);
router.use('/quartos', quartoRoutes);

export default router;