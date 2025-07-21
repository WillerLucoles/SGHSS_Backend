// src/services/horarioService.js
import prisma from '../config/prismaClient.js';
import AppError from '../utils/AppError.js';

/**
 * Serviço responsável pela gestão de horários e agendas dos profissionais.
 * Permite definir grade semanal, criar indisponibilidades e listar agenda detalhada por período.
 */
const horarioService = {
  /**
   * Define a grade semanal de horários de um profissional.
   * Substitui todas as grades existentes pelas novas fornecidas.
   * @param {number} usuarioId - ID do usuário autenticado.
   * @param {Array} gradesDaSemana - Lista de objetos representando a grade semanal.
   * @throws {AppError} Se o profissional não for encontrado.
   */
  definirGradeSemanal: async (usuarioId, gradesDaSemana) => {
    // Busca o profissional pelo usuário logado
    const profissional = await prisma.profissional.findUnique({
      where: { usuarioId },
      select: { id: true },
    });
    if (!profissional) {
      throw new AppError(404, 'Perfil de profissional não encontrado.');
    }

    // Prepara os dados para criação em lote, vinculando ao profissional
    const dadosParaCriar = gradesDaSemana.map(grade => ({
      ...grade,
      profissionalId: profissional.id,
    }));

    // Transação: remove grades antigas e insere as novas
    await prisma.$transaction([
      prisma.gradeHoraria.deleteMany({
        where: { profissionalId: profissional.id },
      }),
      prisma.gradeHoraria.createMany({
        data: dadosParaCriar,
      }),
    ]);
  },

  /**
   * Cria registros de indisponibilidade para um profissional.
   * @param {number} usuarioId - ID do usuário autenticado.
   * @param {Array} listaDeIndisponibilidades - Lista de indisponibilidades.
   * @throws {AppError} Se o profissional não for encontrado.
   */
  criarIndisponibilidades: async (usuarioId, listaDeIndisponibilidades) => {
    const profissional = await prisma.profissional.findUnique({
      where: { usuarioId },
      select: { id: true },
    });
    if (!profissional) {
      throw new AppError(404, 'Perfil de profissional não encontrado.');
    }

    // Prepara os dados para criação em lote
    const dadosParaCriar = listaDeIndisponibilidades.map(ind => ({
      ...ind,
      profissionalId: profissional.id,
    }));

    await prisma.indisponibilidade.createMany({
      data: dadosParaCriar,
    });
  },

  /**
   * Lista a agenda completa do profissional para um período.
   * Inclui horários livres, agendados e bloqueados (indisponibilidades).
   * @param {Object} params - Parâmetros de busca (usuarioId, dataInicio, dataFim).
   * @returns {Promise<Array>} Agenda detalhada por dia.
   * @throws {AppError} Se o profissional não for encontrado.
   */
  listarAgendaProfissionalPorPeriodo: async ({ usuarioId, dataInicio, dataFim }) => {
    // Define o período de busca
    const dataInicioPeriodo = new Date(`${dataInicio}T00:00:00.000Z`);
    const dataFimPeriodo = new Date(`${dataFim}T23:59:59.999Z`);

    // Busca o profissional e suas relações relevantes
    const profissional = await prisma.profissional.findUnique({
      where: { usuarioId },
      include: {
        gradeHoraria: true,
        indisponibilidades: {
          where: {
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

    // Gera a agenda para cada dia do período solicitado
    while (diaAtual <= dataFimPeriodo) {
      const diaDaSemana = diaAtual.getUTCDay();
      const gradeDoDia = profissional.gradeHoraria.find(g => g.diaDaSemana === diaDaSemana);

      if (gradeDoDia) {
        const slotsDoDia = [];
        const { horaInicio, horaFim, duracaoConsultaMinutos } = gradeDoDia;
        const diaString = diaAtual.toISOString().split('T')[0];

        let slotAtualUTC = new Date(`${diaString}T${horaInicio}:00.000Z`);
        const fimDoTrabalhoUTC = new Date(`${diaString}T${horaFim}:00.000Z`);

        // Gera todos os slots do dia conforme a grade
        while (slotAtualUTC < fimDoTrabalhoUTC) {
          slotsDoDia.push(new Date(slotAtualUTC));
          slotAtualUTC.setUTCMinutes(slotAtualUTC.getUTCMinutes() + duracaoConsultaMinutos);
        }

        // Mapeia cada slot para seu status (livre, agendado, bloqueado)
        const agendaDoDia = slotsDoDia.map(slot => {
          const horario = {
            horario: slot.toISOString(),
            status: 'LIVRE',
            info: null,
          };

          // Consulta agendada para o slot
          const consultaAgendada = profissional.consultas.find(c =>
            c.dataHoraInicio.getTime() === slot.getTime()
          );
          if (consultaAgendada) {
            horario.status = 'AGENDADO';
            horario.info = { consultaId: consultaAgendada.id, paciente: consultaAgendada.paciente.nome };
            return horario;
          }

          // Indisponibilidade no slot
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