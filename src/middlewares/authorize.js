// src/middlewares/authorize.js

import AppError from '../utils/AppError.js';

/**
 * Middleware de autorização baseado em papéis (roles).
 * @param {string[]} rolesPermitidas - Um array de strings com os papéis que têm permissão.
 * @returns {Function} - Retorna uma função de middleware do Express.
 */
const authorize = (rolesPermitidas) => {
  return (req, res, next) => {
    if (!req.usuario || !req.usuario.role) {
      return next(
        new AppError(
          401,
          'Informações de autenticação não encontradas. O middleware de autenticação foi executado antes?'
        )
      );
    }

    const { role } = req.usuario;

    // Verifica se o papel do utilizador está na lista de papéis permitidos.
    if (!rolesPermitidas.includes(role)) {
      return next(
        new AppError(
          403, // 403 Forbidden - significa "eu sei quem você é, mas você não pode entrar aqui"
          'Acesso negado. Você não tem permissão para realizar esta ação.'
        )
      );
    }

    // Se o papel for permitido, a requisição pode continuar.
    next();
  };
};

export default authorize;