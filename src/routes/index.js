const express = require('express');
const router = express.Router();

const pacienteRoutes = require('./pacienteRoutes');
const consultaRoutes = require('./consultaRoutes');
const profissionalRoutes = require('./profissionalRoutes');
const disponibilidadeConsultaRoutes = require('./disponibilidadeConsultaRoutes');

router.use('/consultas', consultaRoutes);
router.use('/pacientes', pacienteRoutes);
router.use('/profissionais', profissionalRoutes);
router.use('/disponibilidades', disponibilidadeConsultaRoutes);

module.exports = router;