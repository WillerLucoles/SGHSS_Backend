// src/services/consultaService.js
import prisma from '../config/prismaClient.js';
import AppError from '../utils/AppError.js';
import profissionalService from './profissionalService.js'; 

const consultaService = {
  agendarNovaConsulta: async ({ usuarioId, profissionalId, dataHoraInicio }) => {
    // 1. Encontrar o perfil do paciente
    const paciente = await prisma.paciente.findUnique({
      where: { usuarioId },
      select: { id: true },
    });
    if (!paciente) throw new AppError(404, 'Perfil de paciente não encontrado.');

    // 2. Usar a nossa própria lógica para verificar a disponibilidade
    const dataString = new Date(dataHoraInicio).toISOString().split('T')[0];
    const disponibilidade = await profissionalService.listarDisponibilidadePorDia({
      profissionalId,
      data: dataString,
    });

    const horarioSolicitado = new Date(dataHoraInicio);

    const horarioDisponivel = disponibilidade.some(
      (horario) => horario.getTime() === horarioSolicitado.getTime()
    );

    if (!horarioDisponivel) {
      throw new AppError(409, 'Este horário não está disponível para agendamento. Pode já ter sido reservado.');
    }
    
    // 3. Obter a duração da consulta
    const profissional = await prisma.profissional.findUnique({
        where: { id: profissionalId },
        include: { gradeHoraria: true }
    });
    if (!profissional) throw new AppError(404, 'Profissional não encontrado.');
    
    const diaDaSemana = horarioSolicitado.getUTCDay();
    const gradeDoDia = profissional.gradeHoraria.find(g => g.diaDaSemana === diaDaSemana);
    const duracao = gradeDoDia ? gradeDoDia.duracaoConsultaMinutos : 30;

    const dataHoraFim = new Date(horarioSolicitado.getTime() + duracao * 60000);

    // 4. Criar a consulta
    try {
        const novaConsulta = await prisma.consultas.create({
            data: {
              pacienteId: paciente.id,
              profissionalId: profissionalId,
              dataHoraInicio: horarioSolicitado,
              dataHoraFim: dataHoraFim,
              statusConsulta: 'AGENDADA',
            },
        });
        return novaConsulta;
    } catch (error) {
        if (error.code === 'P2002') {
            throw new AppError(409, 'Conflito de agendamento. Este horário foi reservado no último segundo.');
        }
        throw error;
    }
  },
  
  cancelarConsulta: async ({ consultaId, usuarioId, motivo, canceladoPor }) => {
    // 1. Encontrar a consulta que se quer cancelar
    const consulta = await prisma.consultas.findUnique({
      where: { id: consultaId },
    });
    if (!consulta) throw new AppError(404, 'Consulta não encontrada.');

    // 2. VERIFICAÇÃO DE SEGURANÇA
    if (canceladoPor === 'PACIENTE') {
      const paciente = await prisma.paciente.findFirst({ where: { usuarioId } });
      if (consulta.pacienteId !== paciente?.id) {
        throw new AppError(403, 'Você não tem permissão para cancelar esta consulta.');
      }
    } else if (canceladoPor === 'PROFISSIONAL') {
      const profissional = await prisma.profissional.findFirst({ where: { usuarioId } });
      if (consulta.profissionalId !== profissional?.id) {
        throw new AppError(403, 'Você não tem permissão para cancelar esta consulta.');
      }
    }

    // 3. VERIFICAÇÃO DE LÓGICA
    if (consulta.statusConsulta !== 'AGENDADA') {
      throw new AppError(409, `Não é possível cancelar uma consulta com status "${consulta.statusConsulta}".`);
    }

    // 4. Se tudo estiver OK, atualiza a consulta
    const novoStatus = canceladoPor === 'PACIENTE' ? 'CANCELADA_PACIENTE' : 'CANCELADA_PROFISSIONAL';
    
    return prisma.consultas.update({
      where: { id: consultaId },
      data: {
        statusConsulta: novoStatus,
        motivoCancelamento: motivo,
      },
    });
  },  
};

export default consultaService;