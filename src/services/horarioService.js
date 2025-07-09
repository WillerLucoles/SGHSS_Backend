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

  gerarJanelasDeAtendimento: async ({ usuarioId, dataInicio, dataFim }) => {
    const profissional = await prisma.profissional.findUnique({
      where: { usuarioId },
      include: { horariosPadrao: true },
    });
    if (!profissional) throw new AppError(404, 'Profissional não encontrado.');
    if (profissional.horariosPadrao.length === 0) {
      throw new AppError(400, 'Nenhum horário padrão definido para este profissional.');
    }

    const janelasParaCriar = [];
    let diaAtual = new Date(dataInicio);
    const dataFinal = new Date(dataFim);

    while (diaAtual <= dataFinal) {
      const diaDaSemana = diaAtual.getDay();
      const horarioDoDia = profissional.horariosPadrao.find(h => h.diaDaSemana === diaDaSemana);

      if (horarioDoDia) {
        const { horaInicio, horaFim, duracaoConsultaMinutos } = horarioDoDia;
        const [inicioH, inicioM] = horaInicio.split(':').map(Number);
        const [fimH, fimM] = horaFim.split(':').map(Number);

        let slotAtual = new Date(diaAtual.toISOString().split('T')[0]);
        slotAtual.setUTCHours(inicioH, inicioM, 0, 0);

        const fimDoTrabalho = new Date(diaAtual.toISOString().split('T')[0]);
        fimDoTrabalho.setUTCHours(fimH, fimM, 0, 0);

        while (slotAtual < fimDoTrabalho) {
          const slotFim = new Date(slotAtual.getTime() + duracaoConsultaMinutos * 60000);
          janelasParaCriar.push({
            dataHoraInicio: new Date(slotAtual),
            dataHoraFim: slotFim,
            profissionalId: profissional.id,
          });
          slotAtual = slotFim;
        }
      }
      diaAtual.setUTCDate(diaAtual.getUTCDate() + 1);
    }

    if (janelasParaCriar.length === 0) {
      throw new AppError(400, "Nenhum horário de trabalho encontrado no período especificado.");
    }    
  
    return prisma.janelaDeAtendimento.createMany({
      data: janelasParaCriar,
      skipDuplicates: true,
    });
  },


};

export default horarioService;