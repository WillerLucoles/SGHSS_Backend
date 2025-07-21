// src/routes/quartoRoutes.js
import express from 'express';
import quartoController from '../controllers/quartoController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import authorize from '../middlewares/authorize.js';
import validate from '../middlewares/validate.js';
import { criarQuartoSchema, atualizarQuartoSchema } from '../validators/quartoValidator.js';

const router = express.Router();

// Todas as rotas de quartos são protegidas e acessíveis apenas por Administradores
router.use(authMiddleware, authorize(['ADMINISTRADOR']));

router.post('/', validate(criarQuartoSchema), quartoController.criar);
router.get('/', quartoController.listarTodos);
router.get('/:id', quartoController.buscarPorId);
router.put('/:id', validate(criarQuartoSchema), quartoController.atualizar); // PUT para substituição completa
router.patch('/:id', validate(atualizarQuartoSchema), quartoController.atualizar); // PATCH para atualização parcial
router.delete('/:id', quartoController.deletar);

export default router;