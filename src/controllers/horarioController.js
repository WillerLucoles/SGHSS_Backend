// src/controllers/horarioController.js

import horarioService from '../services/horarioService.js';

const horarioController = {
  definirHorario: async (req, res, next) => {
    try {
      
      const usuarioId = req.usuario.id;  

      const dadosHorario = req.body;
      
      const novoHorario = await horarioService.definirHorarioPadrao(
        usuarioId,
        dadosHorario
      );

      res.status(201).json(novoHorario);
    } catch (err) {

      next(err);
    }
  },


};

export default horarioController;