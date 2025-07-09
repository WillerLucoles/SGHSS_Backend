// src/services/horarioService.js
import prisma from '../config/prismaClient.js';
import AppError from '../utils/AppError.js';

const horarioService = {
  definirHorarioPadrao: async (usuarioId, dadosHorario) => {
    // 1. Encontrar o profissional associado ao utilizador logado
    const profissional = await prisma.profissional.findUnique({
      where: { usuarioId },
      select: { id: true },
    });

    if (!profissional) {
      throw new AppError(404, 'Perfil de profissional não encontrado para este utilizador.');
    }

    // 2. Criar o novo horário padrão associado ao ID do profissional
    const novoHorario = await prisma.horarioPadrao.create({
      data: {
        ...dadosHorario,
        profissionalId: profissional.id,
      },
    });

    return novoHorario;
  },
};

export default horarioService;