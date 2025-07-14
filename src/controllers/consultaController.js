// src/controllers/consultaController.js
import consultaService from '../services/consultaService.js';

const consultaController = {
  agendar: async (req, res, next) => {
    try {

      const usuarioId = req.usuario.id; 
      const dadosAgendamento = req.body;

      const novaConsulta = await consultaService.agendarNovaConsulta({
        usuarioId,
        ...dadosAgendamento,
      });

      res.status(201).json(novaConsulta);
    } catch (err) {
      next(err);
    }
  },

    cancelarPeloPaciente: async (req, res, next) => {
    try {
      const { id: consultaId } = req.params;
      const usuarioId = req.usuario.id; // ID do paciente logado
      const { motivo } = req.body;

      const consultaCancelada = await consultaService.cancelarConsulta({
        consultaId,
        usuarioId,
        motivo,
        canceladoPor: 'PACIENTE',
      });

      res.json(consultaCancelada);
    } catch (err) {
      next(err);
    }
  },

  cancelarPeloProfissional: async (req, res, next) => {
    try {
      const { id: consultaId } = req.params;
      const usuarioId = req.usuario.id; // ID do profissional logado
      const { motivo } = req.body;

      const consultaCancelada = await consultaService.cancelarConsulta({
        consultaId,
        usuarioId,
        motivo,
        canceladoPor: 'PROFISSIONAL',
      });

      res.json(consultaCancelada);
    } catch (err) {
      next(err);
    }
  },
};

export default consultaController;