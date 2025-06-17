// src/services/consultaService.js
const prisma = require('../config/prismaClient');

const consultaService = {
  listarTodos: async () => {
    return await prisma.consulta.findMany();
  },

  buscarPorId: async (id) => {
    return await prisma.consulta.findUnique({ where: { id: Number(id) } });
  },

  criar: async (dados) => {
    return await prisma.consulta.create({ data: dados });
  },

  atualizar: async (id, dados) => {
    return await prisma.consulta.update({
      where: { id: Number(id) },
      data: dados
    });
  },

  deletar: async (id) => {
    return await prisma.consulta.delete({ where: { id: Number(id) } });
  },

  cancelar: async (id) => {
    return await prisma.consulta.update({
      where: { id: Number(id) },
      data: { status: 'cancelada' }
    });
  }
};

module.exports = consultaService;
