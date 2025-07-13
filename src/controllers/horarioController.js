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


};



export default horarioController;