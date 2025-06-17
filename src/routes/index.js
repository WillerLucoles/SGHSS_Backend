// src/routes/index.js
const express = require('express');
const router = express.Router();

const pacienteRoutes = require('./pacienteRoutes');
const consultaRoutes = require('./consultaRoutes');


router.use('/consultas', consultaRoutes);
router.use('/pacientes', pacienteRoutes);


module.exports = router;
