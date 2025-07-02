// src/controllers/disponibilidadeConsultaController.js


import * as disponibilidadeConsultaService from '../services/disponibilidadeConsultaService.js';
import AppError from '../utils/AppError.js';

// --- CONTROLLERS (exportados como um objeto default) ---
const disponibilidadeConsultaController = {
  criar: async (req, res, next) => {
    try {
      const disp = await disponibilidadeConsultaService.criar(req.body);
      res.status(201).json(disp);
    } catch (err) {
      next(err);
    }
  },

  listarPorProfissional: async (req, res, next) => {
    try {
      const profId = Number(req.params.profissionalId);
      const lista =
        await disponibilidadeConsultaService.listarPorProfissional(profId);
      res.json(lista);
    } catch (err) {
      next(err);
    }
  },
};


export default disponibilidadeConsultaController;