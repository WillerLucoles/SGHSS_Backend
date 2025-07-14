// src/services/pacienteService.js

import prisma from '../config/prismaClient.js';
import AppError from '../utils/AppError.js';
import bcrypt from 'bcryptjs';

const pacienteService = {
  // --- FUNÇÃO DE REGISTO PÚBLICO ---
  registrarNovoPaciente: async (dadosPaciente) => {
    const { email, senha, cpf, ...outrosDadosPaciente } = dadosPaciente;

    const usuarioExistente = await prisma.usuario.findUnique({ where: { email } });
    if (usuarioExistente) throw new AppError(409, 'Este email já está em uso.');

    const pacienteExistente = await prisma.paciente.findUnique({ where: { cpf } });
    if (pacienteExistente) throw new AppError(409, 'Este CPF já está cadastrado.');

    const senhaHash = await bcrypt.hash(senha, 8);

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

  // --- FUNÇÕES DO PORTAL DO PACIENTE (/me) ---
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
      },
    });
  },

  // --- FUNÇÕES ADMINISTRATIVAS ---
  listarTodos: async () => {
    return prisma.paciente.findMany({
      select: { id: true, nome: true, cpf: true, tipoCliente: true },
    });
  },

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

  atualizar: async (id, dados) => {
    return prisma.paciente.update({
      where: { id },
      data: dados,
    });
  },

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