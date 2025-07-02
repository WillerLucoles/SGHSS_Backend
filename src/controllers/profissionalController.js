// src/controllers/profissionalController.js

import * as profissionalService from '../services/profissionalService.js';
import AppError from '../utils/AppError.js';

// --- CONTROLLERS ---
const profissionalController = {
  listarTodos: async (req, res, next) => {
    try {
      const list = await profissionalService.listarTodos();
      res.json({ profissionais: list });
    } catch (err) {
      next(err);
    }
  },

  buscarPorId: async (req, res, next) => {
    try {
      const prof = await profissionalService.buscarPorId(req.params.id);
      if (!prof) {
        throw new AppError(404, 'Profissional não encontrado');
      }
      res.json(prof);
    } catch (err) {
      next(err);
    }
  },

  criar: async (req, res, next) => {
    try {
      const dados = req.body;
      const novo = await profissionalService.criar(dados);
      res.status(201).json(novo);
    } catch (err) {
      if (err.code === 'P2002' && err.meta.target.includes('cpf')) {
        return next(new AppError(409, 'CPF de profissional já cadastrado'));
      }
      next(err);
    }
  },

  atualizar: async (req, res, next) => {
    try {
      const atualizado = await profissionalService.atualizar(
        req.params.id,
        req.body
      );
      if (!atualizado) {
        throw new AppError(404, 'Profissional não encontrado para atualização');
      }
      res.json(atualizado);
    } catch (err) {
      next(err);
    }
  },

  deletar: async (req, res, next) => {
    try {
      await profissionalService.deletar(req.params.id);
      res.status(204).send();
    } catch (err) {
      if (err.code === 'P2025') {
        return next(new AppError(404, 'Profissional não encontrado para exclusão'));
      }
      next(err);
    }
  },
};


export default profissionalController;