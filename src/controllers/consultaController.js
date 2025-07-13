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
};

export default consultaController;