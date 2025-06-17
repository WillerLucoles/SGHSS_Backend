// src/services/profissionalService.js
const prisma = require('../config/prismaClient');

const profissionalService = {
  listarTodos: async () => {
    return await prisma.profissionalDeSaude.findMany();
  },

  buscarPorId: async (id) => {
    return await prisma.profissionalDeSaude.findUnique({
      where: { id: Number(id) }
    });
  },

  criar: async (dados) => {
    return await prisma.profissionalDeSaude.create({ data: dados });
  },

  atualizar: async (id, dados) => {
    return await prisma.profissionalDeSaude.update({
      where: { id: Number(id) },
      data: dados
    });
  },

  deletar: async (id) => {
    return await prisma.profissionalDeSaude.delete({
      where: { id: Number(id) }
    });
  }
};

module.exports = profissionalService;
