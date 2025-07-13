// src/services/horarioService.js
import prisma from '../config/prismaClient.js';
import AppError from '../utils/AppError.js';

const horarioService = {
  definirGradeSemanal: async (usuarioId, gradesDaSemana) => {
    // 1. Encontrar o profissional associado ao utilizador logado
    const profissional = await prisma.profissional.findUnique({
      where: { usuarioId },
      select: { id: true },
    });
    if (!profissional) {
      throw new AppError(404, 'Perfil de profissional não encontrado.');
    }

    // 2. Prepara os dados para a criação em lote, adicionando o profissionalId a cada um
    const dadosParaCriar = gradesDaSemana.map(grade => ({
      ...grade,
      profissionalId: profissional.id,
    }));

    // 3. Substituir Tudo: apaga as grades antigas e insere as novas.
    // Tudo dentro de uma transação para garantir que, se algo falhar, nada é alterado.
    await prisma.$transaction([
      // Passo A: Apaga TODAS as grades horárias existentes para este profissional
      prisma.gradeHoraria.deleteMany({
        where: { profissionalId: profissional.id },
      }),
      // Passo B: Cria as novas grades horárias em lote
      prisma.gradeHoraria.createMany({
        data: dadosParaCriar,
      }),
    ]);
  },
};
export default horarioService;