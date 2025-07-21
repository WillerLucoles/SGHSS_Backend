// src/services/quartoService.js
import prisma from '../config/prismaClient.js';
import AppError from '../utils/AppError.js';

const quartoService = {
  criar: async (dados) => {
    return prisma.quarto.create({ data: dados });
  },

  listarTodos: async () => {
    return prisma.quarto.findMany({
      include: { _count: { select: { leitos: true } } },
    });
  },

  buscarPorId: async (id) => {
    const quarto = await prisma.quarto.findUnique({
      where: { id },
      include: { leitos: true },
    });
    if (!quarto) {
      throw new AppError(404, 'Quarto não encontrado.');
    }
    return quarto;
  },

  atualizar: async (id, dados) => {
    try {
      return await prisma.quarto.update({ where: { id }, data: dados });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new AppError(404, 'Quarto não encontrado para atualização.');
      }
      throw error;
    }
  },

  deletar: async (id) => {
    // Regra de negócio: não se pode apagar um quarto que ainda tem leitos.
    const quarto = await prisma.quarto.findUnique({
      where: { id },
      include: { leitos: true },
    });
    if (!quarto) {
      throw new AppError(404, 'Quarto não encontrado para exclusão.');
    }
    if (quarto.leitos.length > 0) {
      throw new AppError(409, 'Não é possível apagar um quarto que ainda possui leitos associados.');
    }
    return prisma.quarto.delete({ where: { id } });
  },
};

export default quartoService;