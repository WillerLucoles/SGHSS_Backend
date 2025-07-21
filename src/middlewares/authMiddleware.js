//src/middlewares/authMiddleware.js

import jwt from 'jsonwebtoken';
import AppError from '../utils/AppError.js';

const authMiddleware = (req, res, next) => {
  // 1. Procurar o token no cabeçalho da requisição
  const authHeader = req.headers.authorization;

  // 2. Verificar se o token existe
  if (!authHeader) {
    return next(new AppError(401, 'Token de autenticação não fornecido.'));
  }

  // O token vem no formato "Bearer <token>".
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return next(new AppError(401, 'Token mal formatado.'));
  }

  const token = parts[1];

  // 3. Validar o token
  try {
    // jwt.verify vai decodificar o token usando nossa chave secreta.
    // Se o token for inválido ou expirado, ele vai lançar um erro.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Se o token for válido, adiciona os dados do usuário (id e role) ao objeto 'req'.
    // Isso permite que os próximos middlewares e controllers saibam quem é o usuário logado.
    req.usuario = { id: decoded.id, role: decoded.role };

    // Deixa a requisição continuar para o seu destino (o controller)
    return next();
  } catch (err) {
    return next(new AppError(401, 'Token inválido ou expirado.'));
  }
};

export default authMiddleware;