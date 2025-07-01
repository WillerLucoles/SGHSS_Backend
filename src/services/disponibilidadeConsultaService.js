const prisma = require('../config/prismaClient');

async function criar({ profissionalId, diaSemana, inicio, fim }) {
  return prisma.disponibilidadeConsulta.create({
    data: { profissionalId, diaSemana, inicio, fim }
  });
}

async function listarPorProfissional(profissionalId) {
  return prisma.disponibilidadeConsulta.findMany({
    where: { profissionalId }
  });
}

module.exports = { criar, listarPorProfissional };
