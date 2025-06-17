// src/controllers/consultaController.js
const consultaService = require('../services/consultaService');

const consultaController = {
  listarTodos: async (req, res) => {
    try {
      const consultas = await consultaService.listarTodos();
      res.json({ consultas });
    } catch (error) {
      console.error("Erro ao listar consultas:", error);
      res.status(500).json({ error: 'Erro ao listar consultas' });
    }
  },

  buscarPorId: async (req, res) => {
    try {
      const idRecebido = req.params.id;
      console.log("Consulta - Buscar por ID:", idRecebido);
      const consulta = await consultaService.buscarPorId(idRecebido);
      if (!consulta) return res.status(404).json({ error: 'Consulta não encontrada' });
      res.json(consulta);
    } catch (error) {
      console.error("Erro ao buscar consulta:", error);
      res.status(500).json({ error: 'Erro ao buscar consulta' });
    }
  },

  criar: async (req, res) => {
    try {
      const novaConsulta = await consultaService.criar(req.body);
      res.status(201).json(novaConsulta);
    } catch (error) {
      console.error("Erro ao criar consulta:", error);
      res.status(500).json({ error: 'Erro ao criar consulta' });
    }
  },

  atualizar: async (req, res) => {
    try {
      const consultaAtualizada = await consultaService.atualizar(req.params.id, req.body);
      res.json(consultaAtualizada);
    } catch (error) {
      console.error("Erro ao atualizar consulta:", error);
      res.status(500).json({ error: 'Erro ao atualizar consulta' });
    }
  },

  deletar: async (req, res) => {
    try {
      await consultaService.deletar(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Erro ao deletar consulta:", error);
      res.status(500).json({ error: 'Erro ao deletar consulta' });
    }
  },

  cancelar: async (req, res) => {
    try {
      const consultaCancelada = await consultaService.cancelar(req.params.id);
      res.json(consultaCancelada);
    } catch (error) {
      console.error("Erro ao cancelar consulta:", error);
      res.status(500).json({ error: 'Erro ao cancelar consulta' });
    }
  }
};

module.exports = consultaController;
