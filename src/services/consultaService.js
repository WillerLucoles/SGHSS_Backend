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
};

export default consultaService;