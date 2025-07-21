// src/controllers/leitoController.js
import leitoService from '../services/leitoService.js';

const leitoController = {
  criar: async (req, res, next) => {
    try {
      const novoLeito = await leitoService.criar(req.body);
      res.status(201).json(novoLeito);
    } catch (err) {
      next(err);
    }
  },

  listarTodos: async (req, res, next) => {
    try {
      const leitos = await leitoService.listarTodos();
      res.json(leitos);
    } catch (err) {
      next(err);
    }
  },

  buscarPorId: async (req, res, next) => {
    try {
      const leito = await leitoService.buscarPorId(req.params.id);
      res.json(leito);
    } catch (err) {
      next(err);
    }
  },

  atualizar: async (req, res, next) => {
    try {
      const leitoAtualizado = await leitoService.atualizar(req.params.id, req.body);
      res.json(leitoAtualizado);
    } catch (err) {
      next(err);
    }
  },

  deletar: async (req, res, next) => {
    try {
      await leitoService.deletar(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};

export default leitoController;