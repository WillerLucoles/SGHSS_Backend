// src/controllers/profissionalController.js
const profissionalService = require('../services/profissionalService');

const profissionalController = {
  listarTodos: async (req, res) => {
    try {
      const profissionais = await profissionalService.listarTodos();
      res.json({ profissionais });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar profissionais' });
    }
  },

  buscarPorId: async (req, res) => {
    try {
      const profissional = await profissionalService.buscarPorId(req.params.id);
      if (!profissional) return res.status(404).json({ error: 'Profissional não encontrado' });
      res.json(profissional);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar profissional' });
    }
  },

  criar: async (req, res) => {
    try {
      const novo = await profissionalService.criar(req.body);
      res.status(201).json(novo);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar profissional' });
    }
  },

  atualizar: async (req, res) => {
    try {
      const atualizado = await profissionalService.atualizar(req.params.id, req.body);
      res.json(atualizado);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar profissional' });
    }
  },

  deletar: async (req, res) => {
    try {
      await profissionalService.deletar(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Erro ao deletar profissional' });
    }
  }
};

module.exports = profissionalController;
