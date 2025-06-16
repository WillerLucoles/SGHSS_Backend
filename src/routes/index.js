// src/routes/index.js
const express = require('express');
const router = express.Router();

const pacienteRoutes = require('./pacienteRoutes');

router.use('/pacientes', pacienteRoutes);

module.exports = router;
