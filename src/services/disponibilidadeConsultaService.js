const prisma = require('../config/prismaClient');

async function criar({ profissionalId, diaSemana, inicio, fim }) {
  return prisma.disponibilidadeProfissional.create({
    data: { profissionalId, diaSemana, inicio, fim }
  });
}

async function listarPorProfissional(profissionalId) {
  return prisma.disponibilidadeProfissional.findMany({
    where: { profissionalId }
  });
}

module.exports = { criar, listarPorProfissional };