// src/controllers/consultaController.js

import * as consultaService from '../services/consultaService.js';
import AppError from '../utils/AppError.js';

// --- CONTROLLERS ---
const consultaController = {
  listarTodos: async (req, res, next) => {
    try {
      const consultas = await consultaService.listarTodos();
      res.json({ consultas });
    } catch (err) {
      next(err);
    }
  },

  buscarPorId: async (req, res, next) => {
    try {
      const consulta = await consultaService.buscarPorId(req.params.id);
      if (!consulta) {

        throw new AppError(404, 'Consulta não encontrada');
      }
      res.json(consulta);
    } catch (err) {
      next(err);
    }
  },

  criar: async (req, res, next) => {
    try {
      const novo = await consultaService.criar(req.body);
      res.status(201).json(novo);
    } catch (err) {
      // Erro de foreign key (pacienteId ou profissionalId inválido)
      if (err.code === 'P2025') {
        return next(
          new AppError(400, 'Paciente ou Profissional não encontrado')
        );
      }
      next(err);
    }
  },

  atualizar: async (req, res, next) => {
    try {
      const atualizado = await consultaService.atualizar(
        req.params.id,
        req.body
      );
      if (!atualizado) {
        throw new AppError(404, 'Consulta não encontrada para atualização');
      }
      res.json(atualizado);
    } catch (err) {
      next(err);
    }
  },

  deletar: async (req, res, next) => {
    try {
      await consultaService.deletar(req.params.id);
      res.status(204).send();
    } catch (err) {
      if (err.code === 'P2025') {
        return next(
          new AppError(404, 'Consulta não encontrada para exclusão')
        );
      }
      next(err);
    }
  },

  cancelar: async (req, res, next) => {
    try {
      const cancelada = await consultaService.cancelar(req.params.id);
      if (!cancelada) {
        throw new AppError(404, 'Consulta não encontrada para cancelamento');
      }
      res.json(cancelada);
    } catch (err) {
      next(err);
    }
  },
};

export default consultaController;