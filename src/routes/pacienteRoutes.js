// src/routes/pacienteRoutes.js

import express from 'express';
import pacienteController from '../controllers/pacienteController.js';

const router = express.Router();

// Nova rota para registro de pacientes
router.post('/register', pacienteController.registrar);

// ... (suas outras rotas de /pacientes, como GET, PUT, DELETE, que devem ser protegidas no futuro)

export default router;