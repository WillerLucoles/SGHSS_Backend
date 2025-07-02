// Em: src/routes/pacienteRoutes.js

import express from 'express';
import pacienteController from '../controllers/pacienteController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import validate from '../middlewares/validate.js';
import { registrarPacienteSchema } from '../validators/pacienteValidator.js';

const router = express.Router();

// Rota pública para registro
router.post(
    '/register',
    validate(registrarPacienteSchema),
    pacienteController.registrar
  );

// Rota protegida para listar todos os pacientes
// 2. Colocamos o 'authMiddleware' ANTES do controller.
// Qualquer requisição para esta rota passará primeiro pelo guardião.
router.get('/', authMiddleware, pacienteController.listarTodos);

// Você pode fazer o mesmo para as outras rotas que precisam de proteção
router.get('/:id', authMiddleware, pacienteController.buscarPorId);
router.put('/:id', authMiddleware, pacienteController.atualizar);
router.delete('/:id', authMiddleware, pacienteController.deletar);

export default router;