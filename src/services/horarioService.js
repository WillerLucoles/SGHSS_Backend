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

    listarAgendaProfissionalPorDia: async (usuarioId, data) => {
    // 1. Encontrar o profissional, as suas grades, indisponibilidades e consultas
    const profissional = await prisma.profissional.findUnique({
      where: { usuarioId },
      include: {
        gradeHoraria: true,
        indisponibilidades: true,
        consultas: {
          include: { // Incluímos os dados do paciente na consulta
            paciente: {
              select: { nome: true }
            }
          }
        },
      },
    });
    if (!profissional) throw new AppError(404, 'Profissional não encontrado.');

    const dataAlvo = new Date(`${data}T00:00:00.000Z`);
    const diaDaSemana = dataAlvo.getUTCDay();

    // 2. Encontrar o horário de trabalho para aquele dia
    const gradeDoDia = profissional.gradeHoraria.find(g => g.diaDaSemana === diaDaSemana);
    if (!gradeDoDia) return []; // Se não trabalha no dia, retorna agenda vazia

    // 3. Gerar todos os slots possíveis para o dia
    const slotsDoDia = [];
    const { horaInicio, horaFim, duracaoConsultaMinutos } = gradeDoDia;
    const diaString = dataAlvo.toISOString().split('T')[0];
    
    let slotAtualUTC = new Date(`${diaString}T${horaInicio}:00.000Z`);
    const fimDoTrabalhoUTC = new Date(`${diaString}T${horaFim}:00.000Z`);

    while (slotAtualUTC < fimDoTrabalhoUTC) {
      slotsDoDia.push(new Date(slotAtualUTC));
      slotAtualUTC.setUTCMinutes(slotAtualUTC.getUTCMinutes() + duracaoConsultaMinutos);
    }

    // 4. Mapear cada slot para o seu status e informação correspondente
    const agendaCompleta = slotsDoDia.map(slot => {
      const horario = {
        horario: slot.toISOString(),
        status: 'LIVRE',
        info: null,
      };

      // Verifica se há uma consulta agendada
      const consultaAgendada = profissional.consultas.find(
        c => c.dataHoraInicio.getTime() === slot.getTime() && c.statusConsulta === 'AGENDADA'
      );
      if (consultaAgendada) {
        horario.status = 'AGENDADO';
        horario.info = {
          consultaId: consultaAgendada.id,
          paciente: consultaAgendada.paciente.nome,
        };
        return horario;
      }

      // Verifica se há um bloqueio
      const indisponibilidade = profissional.indisponibilidades.find(
        i => slot >= i.inicio && slot < i.fim
      );
      if (indisponibilidade) {
        horario.status = 'BLOQUEADO';
        horario.info = {
          motivo: indisponibilidade.motivo || 'Bloqueado',
        };
        return horario;
      }

      return horario;
    });

    return agendaCompleta;
  },

};
export default horarioService;