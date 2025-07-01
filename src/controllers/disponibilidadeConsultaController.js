const disponibilidadeConsultaService = require('../services/disponibilidadeConsultaService');
const AppError = require('../utils/AppError');

module.exports = {
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
      const lista = await disponibilidadeConsultaService.listarPorProfissional(profId);
      res.json(lista);
    } catch (err) {
      next(err);
    }
  }
};