// src/controllers/pacienteController.js
const pacienteService = require('../services/pacienteService');

const pacienteController = {
  listarTodos: async (req, res) => {
    try {
      const pacientes = await pacienteService.listarTodos();
      res.json(pacientes);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar pacientes' });
    }
  },

  buscarPorId: async (req, res) => {
      try {
        const idRecebido = req.params.id;
        console.log("Rota '/:id' acionada com id:", idRecebido);
        const paciente = await pacienteService.buscarPorId(idRecebido);
        if (!paciente) {
          console.log(`Paciente não encontrado para o id: ${idRecebido}`);
          return res.status(404).json({ error: 'Paciente não encontrado' });
        }
        res.json(paciente);
      } catch (error) {
        console.error("Erro no controller:", error);
        res.status(500).json({ error: 'Erro ao buscar paciente' });
      }
    },


  criar: async (req, res) => {
    try {
      const novoPaciente = await pacienteService.criar(req.body);
      res.status(201).json(novoPaciente);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar paciente' });
    }
  },

  atualizar: async (req, res) => {
    try {
      const pacienteAtualizado = await pacienteService.atualizar(req.params.id, req.body);
      res.json(pacienteAtualizado);
    } catch {
      res.status(500).json({ error: 'Erro ao atualizar paciente' });
    }
  },

  deletar: async (req, res) => {
    try {
      await pacienteService.deletar(req.params.id);
      res.status(204).send();
    } catch {
      res.status(500).json({ error: 'Erro ao deletar paciente' });
    }
  }
};

module.exports = pacienteController;
