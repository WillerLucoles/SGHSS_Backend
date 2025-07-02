// src/services/usuarioService.js

import prisma from '../config/prismaClient.js';
import AppError from '../utils/AppError.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const usuarioService = {
  login: async ({ email, senha }) => {
    // 1. Encontrar o usuário pelo email no banco
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    // Se não encontrar o usuário ou a senha não bater, envia um erro genérico
    if (!usuario) {
      throw new AppError(401, 'Email ou senha inválidos.');
    }

    // 2. Comparar a senha enviada com a senha criptografada (hash) no banco
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      throw new AppError(401, 'Email ou senha inválidos.');
    }

    // 3. Se a senha estiver correta, gerar o token JWT
    // O token conterá o ID do usuário e o seu papel (role).
    const token = jwt.sign(
      { id: usuario.id, role: usuario.role },
      process.env.JWT_SECRET, // Uma chave secreta que só o nosso servidor conhece
      { expiresIn: '8h' } // Define a validade do token (ex: 8 horas)
    );

    // Removemos a senha do objeto de usuário antes de retorná-lo
    delete usuario.senha;

    return { token, usuario };
  },
};

export default usuarioService;