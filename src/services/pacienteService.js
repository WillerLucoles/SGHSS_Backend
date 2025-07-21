// src/services/pacienteService.js

import prisma from '../config/prismaClient.js';
import AppError from '../utils/AppError.js';
import bcrypt from 'bcryptjs';

/**
 * Serviço responsável pelas operações relacionadas a pacientes.
 * Inclui registro público, acesso ao portal do paciente, histórico clínico e funções administrativas.
 */
const pacienteService = {
  /**
   * Registra um novo paciente e cria o usuário associado.
   * @param {Object} dadosPaciente - Dados do paciente e do usuário.
   * @throws {AppError} Se o email ou CPF já estiverem cadastrados.
   * @returns {Promise<Object>} Paciente criado.
   */
  registrarNovoPaciente: async (dadosPaciente) => {
    const { email, senha, cpf, ...outrosDadosPaciente } = dadosPaciente;

    // Verifica unicidade de email e CPF
    const usuarioExistente = await prisma.usuario.findUnique({ where: { email } });
    if (usuarioExistente) throw new AppError(409, 'Este email já está em uso.');

    const pacienteExistente = await prisma.paciente.findUnique({ where: { cpf } });
    if (pacienteExistente) throw new AppError(409, 'Este CPF já está cadastrado.');

    // Gera hash da senha
    const senhaHash = await bcrypt.hash(senha, 8);

    // Cria usuário e paciente em transação
    return prisma.$transaction(async (tx) => {
      const novoUsuario = await tx.usuario.create({
        data: { email, senha: senhaHash, role: 'PACIENTE' },
      });
      const pacienteCriado = await tx.paciente.create({
        data: { ...outrosDadosPaciente, cpf, usuarioId: novoUsuario.id },
      });
      return pacienteCriado;
    });
  },

  /**
   * Busca o perfil do paciente pelo ID do usuário autenticado.
   * @param {number} usuarioId - ID do usuário.
   * @throws {AppError} Se o paciente não for encontrado.
   * @returns {Promise<Object>} Dados do paciente.
   */
  buscarPorUsuarioId: async (usuarioId) => {
    const paciente = await prisma.paciente.findUnique({
      where: { usuarioId },
      include: { usuario: { select: { email: true } } },
    });
    if (!paciente) {
      throw new AppError(404, 'Perfil de paciente não encontrado para este utilizador.');
    }
    return paciente;
  },

  /**
   * Atualiza o perfil do paciente autenticado.
   * @param {number} usuarioId - ID do usuário.
   * @param {Object} dadosParaAtualizar - Dados a serem atualizados.
   * @throws {AppError} Se o paciente não for encontrado.
   * @returns {Promise<Object>} Paciente atualizado.
   */
  atualizarMeuPerfil: async (usuarioId, dadosParaAtualizar) => {
    const paciente = await prisma.paciente.findUnique({
      where: { usuarioId },
      select: { id: true },
    });
    if (!paciente) {
      throw new AppError(404, 'Perfil de paciente não encontrado para este utilizador.');
    }
    return prisma.paciente.update({
      where: { id: paciente.id },
      data: dadosParaAtualizar,
    });
  },

  /**
   * Lista todas as consultas do paciente autenticado.
   * @param {number} usuarioId - ID do usuário.
   * @throws {AppError} Se o paciente não for encontrado.
   * @returns {Promise<Array>} Lista de consultas.
   */
  listarConsultasPorPaciente: async (usuarioId) => {
    const paciente = await prisma.paciente.findUnique({ where: { usuarioId } });
    if (!paciente) {
      throw new AppError(404, 'Perfil de paciente não encontrado.');
    }
    return prisma.consultas.findMany({
      where: { pacienteId: paciente.id },
      orderBy: { dataHoraInicio: 'desc' },
      include: {
        profissional: {
          select: { nome: true, especialidadePrincipal: true },
        },
        registroClinico: {
          select: {
            queixa: true,
            conduta: true,
            observacoesAdicionais: true,
            anexos: {
              select: {
                nomeArquivo: true,
                tipoDocumento: true,
                urlArquivoSimulado: true,
              }
            }
          }
        }
      },
    });
  },

  /**
   * Busca o histórico clínico do paciente (consultas realizadas).
   * @param {number} pacienteId - ID do paciente.
   * @throws {AppError} Se o paciente não for encontrado.
   * @returns {Promise<Array>} Consultas realizadas com registros clínicos.
   */
  buscarHistoricoClinico: async (pacienteId) => {
    // Verifica existência do paciente
    const paciente = await prisma.paciente.findUnique({
      where: { id: pacienteId },
    });
    if (!paciente) {
      throw new AppError(404, 'Paciente não encontrado.');
    }

    // Busca consultas realizadas e respectivos registros clínicos
    const consultasRealizadas = await prisma.consultas.findMany({
      where: {
        pacienteId: pacienteId,
        statusConsulta: 'REALIZADA',
      },
      orderBy: {
        dataHoraInicio: 'desc',
      },
      include: {
        registroClinico: {
          include: {
            anexos: true,
          },
        },
        profissional: {
          select: {
            nome: true,
            especialidadePrincipal: true,
          },
        },
      },
    });

    return consultasRealizadas;
  },

  /**
   * Lista todos os pacientes (função administrativa).
   * @returns {Promise<Array>} Lista de pacientes.
   */
  listarTodos: async () => {
    return prisma.paciente.findMany({
      select: { id: true, nome: true, cpf: true, tipoCliente: true },
    });
  },

  /**
   * Busca um paciente pelo ID (função administrativa).
   * @param {number} id - ID do paciente.
   * @throws {AppError} Se o paciente não for encontrado.
   * @returns {Promise<Object>} Paciente encontrado.
   */
  buscarPorId: async (id) => {
    const paciente = await prisma.paciente.findUnique({
      where: { id },
      include: { usuario: { select: { email: true } } },
    });
    if (!paciente) {
      throw new AppError(404, 'Paciente com o ID especificado não encontrado.');
    }
    return paciente;
  },

  /**
   * Atualiza os dados de um paciente (função administrativa).
   * @param {number} id - ID do paciente.
   * @param {Object} dados - Dados para atualização.
   * @returns {Promise<Object>} Paciente atualizado.
   */
  atualizar: async (id, dados) => {
    return prisma.paciente.update({
      where: { id },
      data: dados,
    });
  },

  /**
   * Remove um paciente e o usuário associado (função administrativa).
   * @param {number} id - ID do paciente.
   * @throws {AppError} Se o paciente não for encontrado.
   * @returns {Promise<void>}
   */
  deletar: async (id) => {
    const paciente = await prisma.paciente.findUnique({ where: { id } });
    if (!paciente) throw new AppError(404, 'Paciente não encontrado para exclusão.');

    return prisma.$transaction(async (tx) => {
      await tx.paciente.delete({ where: { id } });
      await tx.usuario.delete({ where: { id: paciente.usuarioId } });
    });
  },
};

export default pacienteService;