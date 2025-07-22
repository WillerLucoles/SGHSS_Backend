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

  adicionarRegistro: async (req, res, next) => {
    try {
      const { id: internacaoId } = req.params;
      const profissionalUsuarioId = req.usuario.id;
      const dadosDoRegistro = req.body;

      const novoRegistro = await internacaoService.adicionarRegistro({
        internacaoId,
        profissionalUsuarioId,
        dadosDoRegistro,
      });

      res.status(201).json(novoRegistro);
    } catch (err) {
      next(err);
    }
  }, 

  darAlta: async (req, res, next) => {
    try {
      const { id: internacaoId } = req.params;

      const internacaoFinalizada = await internacaoService.darAlta(internacaoId);

      res.json(internacaoFinalizada);
    } catch (err) {
      next(err);
    }
  },  
};

export default internacaoController;