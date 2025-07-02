// src/routes/index.js

import express from 'express';
import pacienteRoutes from './pacienteRoutes.js';
import consultaRoutes from './consultaRoutes.js';
import profissionalRoutes from './profissionalRoutes.js';
import disponibilidadeConsultaRoutes from './disponibilidadeConsultaRoutes.js';

// --- CONFIGURAÇÃO DO ROTEADOR PRINCIPAL ---
const router = express.Router();

// Roteador principal para delegar cada caminho para o seu roteador específico.
// Ex: qualquer requisição para /api/consultas será gerenciada pelo consultaRoutes.
router.use('/consultas', consultaRoutes);
router.use('/pacientes', pacienteRoutes);
router.use('/profissionais', profissionalRoutes);
router.use('/disponibilidades', disponibilidadeConsultaRoutes);


export default router;