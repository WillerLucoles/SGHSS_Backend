// src/routes/internacaoRoutes.js
import express from 'express';
import internacaoController from '../controllers/internacaoController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import authorize from '../middlewares/authorize.js';
import validate from '../middlewares/validate.js';
import { criarInternacaoSchema } from '../validators/internacaoValidator.js';

const router = express.Router();

// Apenas Admins e Profissionais podem gerir internações
router.use(authMiddleware, authorize(['ADMINISTRADOR', 'PROFISSIONAL']));

// Rota para criar uma nova internação (admitir um paciente)
router.post('/', validate(criarInternacaoSchema), internacaoController.criar);

export default router;