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
      const { data } = req.query;

      if (!data) {
        throw new AppError(400, 'O parâmetro de data é obrigatório.');
      }

      const agendaDoDia = await horarioService.listarAgendaProfissionalPorDia(
        usuarioId,
        data
      );

      res.json(agendaDoDia);
    } catch (err) {
      next(err);
    }
  },  


};



export default horarioController;