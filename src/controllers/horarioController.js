// src/controllers/horarioController.js
import horarioService from '../services/horarioService.js';

const horarioController = {
  definirGradeSemanal: async (req, res, next) => {
    try {
      const usuarioId = req.usuario.id;
      const gradesDaSemana = req.body;

      await horarioService.definirGradeSemanal(
        usuarioId,
        gradesDaSemana
      );

      res.status(201).json({ message: 'Grade horária semanal definida com sucesso.' });
    } catch (err) {
      next(err);
    }
  },

  criarIndisponibilidades: async (req, res, next) => {
    try {
      const usuarioId = req.usuario.id;
      const listaDeIndisponibilidades = req.body;!

      await horarioService.criarIndisponibilidades(
        usuarioId,
        listaDeIndisponibilidades
      );

      res.status(201).json({ message: 'Indisponibilidades criadas com sucesso.' });
    } catch (err) {
      next(err);
    }
  },

  listarMinhaAgenda: async (req, res, next) => {
    try {
      const usuarioId = req.usuario.id;
      const { dataInicio, dataFim } = req.query;

      // Validação básica
      if (!dataInicio || !dataFim) {
        throw new AppError(400, 'Os parâmetros de dataInicio и dataFim são obrigatórios.');
      }

      const agendaCompleta = await horarioService.listarAgendaProfissionalPorPeriodo({
        usuarioId,
        dataInicio,
        dataFim,
      });

      res.json(agendaCompleta);
    } catch (err) {
      next(err);
    }
  },


};



export default horarioController;