// src/routes/index.js
const express = require('express');
const router = express.Router();

const pacienteRoutes = require('./pacienteRoutes');
const consultaRoutes = require('./consultaRoutes');
const profissionalRoutes = require('./profissionalRoutes');


router.use('/consultas', consultaRoutes);
router.use('/pacientes', pacienteRoutes);
router.use('/profissionais', profissionalRoutes);


module.exports = router;
