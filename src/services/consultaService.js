// src/services/consultaService.js

import prisma from '../config/prismaClient.js';
import AppError from '../utils/AppError.js';
import profissionalService from './profissionalService.js';

const consultaService = {
  /**
   * Agenda uma nova consulta de forma flexível.
   * Pode ser chamada por um paciente (usando o seu `usuarioId` do token)
   * ou por um profissional (fornecendo o `pacienteId` diretamente no corpo da requisição).
   * @param {object} dados - Dados do agendamento.
   * @param {string} [dados.usuarioId] - O ID do usuário (paciente) que está logado.
   * @param {string} [dados.pacienteId] - O ID do paciente para quem a consulta está a ser marcada (usado pelo profissional).
   * @param {string} dados.profissionalId - O ID do profissional com quem se quer agendar.
   * @param {string} dados.dataHoraInicio - O horário exato do slot escolhido em formato ISO 8601 UTC.
   * @returns {Promise<object>} A nova consulta criada.
   */
  agendarNovaConsulta: async (dados) => {
    // Desestrutura todos os possíveis dados que a função pode receber
    const { usuarioId, pacienteId: pacienteIdDoBody, profissionalId, dataHoraInicio } = dados;
    let pacienteIdFinal = pacienteIdDoBody;

    // 1. DETERMINAR O PACIENTE CORRETO
    if (usuarioId) {
      const paciente = await prisma.paciente.findUnique({
        where: { usuarioId },
        select: { id: true },
      });
      if (!paciente) throw new AppError(404, 'Perfil de paciente não encontrado para este utilizador.');
      pacienteIdFinal = paciente.id;
    }
    if (!pacienteIdFinal) {
        throw new AppError(400, 'ID do paciente não foi fornecido ou não foi encontrado.');
    }

    // 2. VERIFICAR A DISPONIBILIDADE DO HORÁRIO
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

    // 3. CALCULAR A HORA DE FIM DA CONSULTA
    const profissional = await prisma.profissional.findUnique({
        where: { id: profissionalId },
        include: { gradeHoraria: true }
    });
    if (!profissional) throw new AppError(404, 'Profissional não encontrado.');
    
    const diaDaSemana = horarioSolicitado.getUTCDay();
    const gradeDoDia = profissional.gradeHoraria.find(g => g.diaDaSemana === diaDaSemana);
    const duracao = gradeDoDia ? gradeDoDia.duracaoConsultaMinutos : 30; 

    const dataHoraFim = new Date(horarioSolicitado.getTime() + duracao * 60000);

    // 4. CRIAR A CONSULTA DE FORMA SEGURA
    // A trava @@unique no schema impede agendamentos duplicados em caso de condições de corrida.
    try {
        const novaConsulta = await prisma.consultas.create({
            data: {
              pacienteId: pacienteIdFinal, // Usamos o ID final do paciente
              profissionalId: profissionalId,
              dataHoraInicio: horarioSolicitado,
              dataHoraFim: dataHoraFim,
              statusConsulta: 'AGENDADA',
            },
        });
        return novaConsulta;
    } catch (error) {
        // Captura o erro 'P2002' do Prisma, que acontece se houver uma tentativa de criar uma consulta
        // para um horário que acabou de ser preenchido (conflito de chave única).
        if (error.code === 'P2002') {
            throw new AppError(409, 'Conflito de agendamento. Este horário foi reservado no último segundo.');
        }
        throw error;
    }
  },
  

  cancelarConsulta: async ({ consultaId, usuarioId, motivo, canceladoPor }) => {
    const consulta = await prisma.consultas.findUnique({
      where: { id: consultaId },
    });
    if (!consulta) throw new AppError(404, 'Consulta não encontrada.');

    // Verificação de Segurança
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

    // Verificação de Lógica
    if (consulta.statusConsulta !== 'AGENDADA') {
      throw new AppError(409, `Não é possível cancelar uma consulta com status "${consulta.statusConsulta}".`);
    }

    // Atualização
    const novoStatus = canceladoPor === 'PACIENTE' ? 'CANCELADA_PACIENTE' : 'CANCELADA_PROFISSIONAL';
    return prisma.consultas.update({
      where: { id: consultaId },
      data: {
        statusConsulta: novoStatus,
        motivoCancelamento: motivo,
      },
    });
  },
  
  salvarRegistroClinico: async ({ consultaId, usuarioId, dadosDoRegistro }) => {
    const { anexos, ...dadosPrincipais } = dadosDoRegistro;

    // 1. Validar a consulta e a permissão do profissional
    const consulta = await prisma.consultas.findFirst({
      where: { 
        id: consultaId,
        profissional: {
            usuarioId: usuarioId
        }
      },
    });
    if (!consulta) {
      throw new AppError(404, 'Consulta não encontrada ou você não tem permissão para editá-la.');
    }
    console.log('--- DEBUG: DADOS RECEBIDOS PELO SERVIÇO ---');
    console.log('Dados completos (dadosDoRegistro):', dadosDoRegistro);
    console.log('Dados principais (após separar anexos):', dadosPrincipais);
    console.log('-------------------------------------------');

    // 2. Usar uma transação para garantir que tudo aconteça de uma vez
    return prisma.$transaction(async (tx) => {
      // Usamos 'upsert': se o registro não existe, ele cria; se existe, atualiza.
      const registro = await tx.registroClinico.upsert({
        where: { consultaId: consultaId },
        update: { ...dadosPrincipais },
        create: {
          ...dadosPrincipais,
          consultaId: consultaId,
          profissionalId: consulta.profissionalId,
        },
      });

      // 3. Lidar com os anexos simulados
      if (anexos && anexos.length > 0) {
        // Primeiro, apaga os anexos antigos para evitar duplicatas
        await tx.anexoClinico.deleteMany({
          where: { registroClinicoId: registro.id },
        });
        // Depois, cria os novos
        await tx.anexoClinico.createMany({
          data: anexos.map(anexo => ({
            ...anexo,
            urlArquivoSimulado: `/uploads/simulado/${anexo.nomeArquivo}`,
            registroClinicoId: registro.id,
          })),
        });
      }
      
      // 4. Mudar o status da consulta para REALIZADA
       await tx.consultas.update({
        where: { id: consultaId },
        data: { statusConsulta: 'REALIZADA' },
      });

      // 5. Retornar o registro clínico completo
      return tx.registroClinico.findUnique({
        where: { id: registro.id },
        include: { anexos: true },
      });
    });
  },
};

export default consultaService;