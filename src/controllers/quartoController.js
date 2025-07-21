// src/controllers/quartoController.js
import quartoService from '../services/quartoService.js';

const quartoController = {
  criar: async (req, res, next) => {
    try {
      const novoQuarto = await quartoService.criar(req.body);
      res.status(201).json(novoQuarto);
    } catch (err) {
      next(err);
    }
  },

  listarTodos: async (req, res, next) => {
    try {
      const quartos = await quartoService.listarTodos();
      res.json(quartos);
    } catch (err) {
      next(err);
    }
  },

  buscarPorId: async (req, res, next) => {
    try {
      const quarto = await quartoService.buscarPorId(req.params.id);
      res.json(quarto);
    } catch (err) {
      next(err);
    }
  },

  atualizar: async (req, res, next) => {
    try {
      const quartoAtualizado = await quartoService.atualizar(req.params.id, req.body);
      res.json(quartoAtualizado);
    } catch (err) {
      next(err);
    }
  },

  deletar: async (req, res, next) => {
    try {
      await quartoService.deletar(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};

export default quartoController;