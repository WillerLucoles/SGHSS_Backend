// src/services/profissionalService.js

import prisma from '../config/prismaClient.js';
import AppError from '../utils/AppError.js';
import bcrypt from 'bcryptjs';

const profissionalService = {
  // Lógica completa para criar um novo profissional e o seu utilizador
  criar: async (dadosProfissional) => {
    const { email, senha, cpf, crm, ...outrosDados } = dadosProfissional;

    // Verificar se email, CPF ou CRM já existem
    const conflitoEmail = await prisma.usuario.findUnique({ where: { email } });
    if (conflitoEmail) throw new AppError(409, 'Este email já está em uso.');
    
    const conflitoCpf = await prisma.profissional.findUnique({ where: { cpf } });
    if (conflitoCpf) throw new AppError(409, 'Este CPF já pertence a um profissional.');

    const conflitoCrm = await prisma.profissional.findUnique({ where: { crm } });
    if (conflitoCrm) throw new AppError(409, 'Este CRM já pertence a um profissional.');

    // Criptografar a senha inicial
    const senhaHash = await bcrypt.hash(senha, 8);

    // Usar uma transação para garantir a criação atómica dos dois registos
    return prisma.$transaction(async (tx) => {
      const novoUsuario = await tx.usuario.create({
        data: {
          email,
          senha: senhaHash,
          role: 'PROFISSIONAL',
        },
      });

      const profissionalCriado = await tx.profissional.create({
        data: {
          ...outrosDados,
          cpf,
          crm,
          usuarioId: novoUsuario.id,
        },
      });

      return profissionalCriado;
    });
  },

  listarTodos: async () => {
    return prisma.profissional.findMany();
  },

  buscarPorId: async (id) => {
    return prisma.profissional.findUnique({
      where: { id: id },
    });
  },

  atualizar: async (id, dados) => {
    return prisma.profissional.update({
      where: { id: id },
      data: dados,
    });
  },

  deletar: async (id) => {
    const profissional = await prisma.profissional.findUnique({ where: { id } });
    if (!profissional) throw new AppError(404, 'Profissional não encontrado.');

    return prisma.$transaction(async (tx) => {
      await tx.profissional.delete({ where: { id } });
      await tx.usuario.delete({ where: { id: profissional.usuarioId } });
    });
  },
};

export default profissionalService;