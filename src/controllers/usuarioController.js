// src/controllers/usuarioController.js

import usuarioService from '../services/usuarioService.js';

const usuarioController = {
  login: async (req, res, next) => {
    try {
      const { email, senha } = req.body;
      const { token, usuario } = await usuarioService.login({ email, senha });

      // Envia o token e os dados básicos do usuário como resposta
      res.json({ token, usuario });
    } catch (error) {
      next(error);
    }
  },
};

export default usuarioController;