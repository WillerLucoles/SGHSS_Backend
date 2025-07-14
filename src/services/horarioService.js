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

  criarIndisponibilidades: async (usuarioId, listaDeIndisponibilidades) => {
    const profissional = await prisma.profissional.findUnique({
      where: { usuarioId },
      select: { id: true },
    });
    if (!profissional) {
      throw new AppError(404, 'Perfil de profissional não encontrado.');
    }

    // Prepara os dados para a criação em lote, adicionando o profissionalId a cada um
    const dadosParaCriar = listaDeIndisponibilidades.map(ind => ({
      ...ind,
      profissionalId: profissional.id,
    }));

    // Usa o createMany para inserir todos os registos de uma só vez, de forma eficiente
    await prisma.indisponibilidade.createMany({
      data: dadosParaCriar,
    });
  },

  listarAgendaProfissionalPorPeriodo: async ({ usuarioId, dataInicio, dataFim }) => {
    // 1. Encontrar o profissional
    const dataInicioPeriodo = new Date(`${dataInicio}T00:00:00.000Z`);
    const dataFimPeriodo = new Date(`${dataFim}T23:59:59.999Z`);

    const profissional = await prisma.profissional.findUnique({
      where: { usuarioId },
      include: {
        gradeHoraria: true,
        // Filtrar na base de dados
        indisponibilidades: {
          where: {
            // A indisponibilidade cruza com o período solicitado?
            inicio: { lte: dataFimPeriodo },
            fim: { gte: dataInicioPeriodo },
          },
        },
        consultas: {
          where: {
            dataHoraInicio: {
              gte: dataInicioPeriodo,
              lte: dataFimPeriodo,
            },
            statusConsulta: 'AGENDADA',
          },
          include: {
            paciente: { select: { nome: true } },
          },
        },
      },
    });

    if (!profissional) throw new AppError(404, 'Profissional não encontrado.');

    const agendaCompleta = [];
    let diaAtual = new Date(dataInicioPeriodo);

    // 2. Loop por cada dia no intervalo solicitado
    while (diaAtual <= dataFimPeriodo) {
      const diaDaSemana = diaAtual.getUTCDay();
      const gradeDoDia = profissional.gradeHoraria.find(g => g.diaDaSemana === diaDaSemana);

      if (gradeDoDia) {
        const slotsDoDia = [];
        const { horaInicio, horaFim, duracaoConsultaMinutos } = gradeDoDia;
        const diaString = diaAtual.toISOString().split('T')[0];
        
        let slotAtualUTC = new Date(`${diaString}T${horaInicio}:00.000Z`);
        const fimDoTrabalhoUTC = new Date(`${diaString}T${horaFim}:00.000Z`);

        while (slotAtualUTC < fimDoTrabalhoUTC) {
          slotsDoDia.push(new Date(slotAtualUTC));
          slotAtualUTC.setUTCMinutes(slotAtualUTC.getUTCMinutes() + duracaoConsultaMinutos);
        }

        const agendaDoDia = slotsDoDia.map(slot => {
          const horario = {
            horario: slot.toISOString(),
            status: 'LIVRE',
            info: null,
          };

          const consultaAgendada = profissional.consultas.find(c => 
            c.dataHoraInicio.getTime() === slot.getTime()
          );
          if (consultaAgendada) {
            horario.status = 'AGENDADO';
            horario.info = { consultaId: consultaAgendada.id, paciente: consultaAgendada.paciente.nome };
            return horario;
          }

          const indisponibilidade = profissional.indisponibilidades.find(i => 
            slot >= i.inicio && slot < i.fim
          );
          if (indisponibilidade) {
            horario.status = 'BLOQUEADO';
            horario.info = { motivo: indisponibilidade.motivo || 'Bloqueado' };
            return horario;
          }

          return horario;
        });
        
        if (agendaDoDia.length > 0) {
          agendaCompleta.push({
            data: diaAtual.toISOString().split('T')[0],
            horarios: agendaDoDia,
          });
        }
      }
      diaAtual.setUTCDate(diaAtual.getUTCDate() + 1);
    }

    return agendaCompleta;
  },
};
export default horarioService;