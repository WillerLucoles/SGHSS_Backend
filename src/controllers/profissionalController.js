// src/controllers/profissionalController.js

import profissionalService from '../services/profissionalService.js';
import AppError from '../utils/AppError.js';

const profissionalController = {
  // --- ROTAS /me PARA O PROFISSIONAL LOGADO ---

  buscarMeuPerfil: async (req, res, next) => {
    try {
      const profissional = await profissionalService.buscarPorUsuarioId(
        req.usuario.id
      );
      res.json(profissional);
    } catch (err) {
      next(err);
    }
  },

  atualizarMeuPerfil: async (req, res, next) => {
    try {
      const profissionalAtualizado = await profissionalService.atualizarMeuPerfil(
        req.usuario.id,
        req.body
      );
      res.json(profissionalAtualizado);
    } catch (err) {
      next(err);
    }
  },

  // --- ROTAS ADMINISTRATIVAS ---

  criar: async (req, res, next) => {
    try {
      const novoProfissional = await profissionalService.criar(req.body);
      res.status(201).json(novoProfissional);
    } catch (err) {
      next(err);
    }
  },

  listarTodos: async (req, res, next) => {
    try {
      const listaDeProfissionais = await profissionalService.listarTodos();
      res.json(listaDeProfissionais);
    } catch (err) {
      next(err);
    }
  },

  buscarPorId: async (req, res, next) => {
    try {
      const profissional = await profissionalService.buscarPorId(req.params.id);
      // A verificação de "não encontrado" é melhor delegada ao serviço.
      if (!profissional) {
        throw new AppError(404, 'Profissional não encontrado.');
      }
      res.json(profissional);
    } catch (err) {
      next(err);
    }
  },

  atualizar: async (req, res, next) => {
    try {
      const profissionalAtualizado = await profissionalService.atualizar(
        req.params.id,
        req.body
      );
      res.json(profissionalAtualizado);
    } catch (err) {
      // O erro P2025 do Prisma significa "registo para atualizar não encontrado".
      if (err.code === 'P2025') {
        return next(
          new AppError(404, 'Profissional não encontrado para atualização.')
        );
      }
      next(err);
    }
  },

  deletar: async (req, res, next) => {
    try {
      await profissionalService.deletar(req.params.id);
      res.status(204).send();
    } catch (err) {
      if (err.code === 'P2025') {
        return next(
          new AppError(404, 'Profissional não encontrado para exclusão.')
        );
      }
      next(err);
    }
  },
};

export default profissionalController;