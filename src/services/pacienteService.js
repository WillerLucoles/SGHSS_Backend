// src/services/pacienteService.js

const prisma = require('../config/prismaClient');

const pacienteService = {
  listarTodos: async () => {
    return await prisma.paciente.findMany();
  },

  buscarPorId: async (id) => {
    return await prisma.paciente.findUnique({ where: { id: Number(id) } });
  },

  criar: async (dados) => {
    return await prisma.paciente.create({ data: dados });
  },

  atualizar: async (id, dados) => {
    return await prisma.paciente.update({
      where: { id: Number(id) },
      data: dados
    });
  },

  deletar: async (id) => {
    return await prisma.paciente.delete({ where: { id: Number(id) } });
  }
};

module.exports = pacienteService;
