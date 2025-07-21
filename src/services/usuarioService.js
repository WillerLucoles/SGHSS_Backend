// src/services/usuarioService.js

import prisma from '../config/prismaClient.js';
import AppError from '../utils/AppError.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * Serviço responsável pela autenticação e operações relacionadas ao usuário.
 * Inclui login e geração de token JWT.
 */
const usuarioService = {
  /**
   * Realiza o login do usuário, validando email e senha.
   * @param {Object} params - { email, senha }
   * @throws {AppError} Se o email não existir ou a senha estiver incorreta.
   * @returns {Promise<Object>} Objeto contendo o token JWT e os dados do usuário (sem a senha).
   */
  login: async ({ email, senha }) => {
    // Busca o usuário pelo email
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    // Se não encontrar o usuário ou a senha não bater, envia um erro genérico
    if (!usuario) {
      throw new AppError(401, 'Email ou senha inválidos.');
    }

    // Compara a senha enviada com a senha criptografada (hash) no banco
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      throw new AppError(401, 'Email ou senha inválidos.');
    }

    // Gera o token JWT contendo o ID do usuário e o seu papel (role)
    const token = jwt.sign(
      { id: usuario.id, role: usuario.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Remove a senha do objeto de usuário antes de retorná-lo
    delete usuario.senha;

    return { token, usuario };
  },
};

export default usuarioService;