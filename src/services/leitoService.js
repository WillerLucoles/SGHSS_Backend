// src/services/leitoService.js
import prisma from '../config/prismaClient.js';
import AppError from '../utils/AppError.js';

const leitoService = {
  criar: async (dados) => {
    // Regra de negócio: não se pode adicionar um leito a um quarto que já está na sua capacidade máxima.
    const quarto = await prisma.quarto.findUnique({
        where: { id: dados.quartoId },
        include: { _count: { select: { leitos: true } } },
    });
    if (!quarto) {
        throw new AppError(404, 'Quarto não encontrado para associar o leito.');
    }
    if (quarto._count.leitos >= quarto.capacidade) {
        throw new AppError(409, 'A capacidade máxima do quarto já foi atingida.');
    }
    return prisma.leito.create({ data: dados });
  },

  listarTodos: async () => {
    return prisma.leito.findMany({
      include: { quarto: { select: { numeroQuarto: true, categoria: true } } },
    });
  },

  buscarPorId: async (id) => {
    const leito = await prisma.leito.findUnique({
      where: { id },
      include: { quarto: true },
    });
    if (!leito) {
      throw new AppError(404, 'Leito não encontrado.');
    }
    return leito;
  },

  atualizar: async (id, dados) => {
    try {
      return await prisma.leito.update({ where: { id }, data: dados });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new AppError(404, 'Leito não encontrado para atualização.');
      }
      throw error;
    }
  },

  deletar: async (id) => {
    // Regra de negócio: não se pode apagar um leito que está ocupado.
    const leito = await prisma.leito.findUnique({ where: { id } });
    if (!leito) {
      throw new AppError(404, 'Leito não encontrado para exclusão.');
    }
    if (leito.status === 'OCUPADO') {
      throw new AppError(409, 'Não é possível apagar um leito que está atualmente ocupado.');
    }
    return prisma.leito.delete({ where: { id } });
  },
};

export default leitoService;