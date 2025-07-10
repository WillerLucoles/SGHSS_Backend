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
    const profissional = await prisma.profissional.findUnique({ /* ... */ });
    if (!profissional) throw new AppError(404, 'Profissional não encontrado.');
    if (profissional.horariosPadrao.length === 0) {
        throw new AppError(400, 'Nenhum horário padrão definido.');
    }

    const janelasParaCriar = [];
    let diaAtual = new Date(dataInicio);
    const dataFinal = new Date(dataFim);

    while (diaAtual <= dataFinal) {
        const diaDaSemana = diaAtual.getUTCDay();
        const horarioDoDia = profissional.horariosPadrao.find(
            (h) => h.diaDaSemana === diaDaSemana
        );

        if (horarioDoDia) {
            const { horaInicio, horaFim, duracaoConsultaMinutos } = horarioDoDia;
            

            const diaString = diaAtual.toISOString().split('T')[0]; 
            

            let slotAtualUTC = new Date(`${diaString}T${horaInicio}:00.000Z`);
            const fimDoTrabalhoUTC = new Date(`${diaString}T${horaFim}:00.000Z`);

            while (slotAtualUTC < fimDoTrabalhoUTC) {
                const slotFimUTC = new Date(
                    slotAtualUTC.getTime() + duracaoConsultaMinutos * 60000
                );
                
                janelasParaCriar.push({
                    dataHoraInicio: slotAtualUTC,
                    dataHoraFim: slotFimUTC,
                    profissionalId: profissional.id,
                });
                slotAtualUTC = slotFimUTC;
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