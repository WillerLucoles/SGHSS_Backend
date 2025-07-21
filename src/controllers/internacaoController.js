// src/controllers/internacaoController.js
import internacaoService from '../services/internacaoService.js';

const internacaoController = {
  criar: async (req, res, next) => {
    try {
      // O profissional responsável agora vem diretamente no corpo da requisição.
      const novaInternacao = await internacaoService.criar(req.body);
      res.status(201).json(novaInternacao);
    } catch (err) {
      next(err);
    }
  },
};

export default internacaoController;