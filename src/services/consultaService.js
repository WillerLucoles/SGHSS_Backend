const prisma = require('../config/prismaClient');
const AppError = require('../utils/AppError');

async function criar(data) {
  const { profissionalId, dataConsulta, horario } = data;
  const diaSemana = new Date(dataConsulta).getDay();

  const disp = await prisma.disponibilidadeProfissional.findFirst({
    where: {
      profissionalId,
      diaSemana,
      inicio: { lte: horario },
      fim:   { gte: horario }
    }
  });
  if (!disp) {
    throw new AppError(
      400,
      'Profissional não atende no dia/horário solicitado'
    );
  }

  const conflito = await prisma.consulta.findFirst({
    where: {
      profissionalId,
      dataConsulta,
      horario
    }
  });
  if (conflito) {
    throw new AppError(409, 'Horário já reservado para outro paciente');
  }

  return prisma.consulta.create({ data });
}

async function listarTodos() {
  return prisma.consulta.findMany();
}

module.exports = {
  criar,
  listarTodos
};