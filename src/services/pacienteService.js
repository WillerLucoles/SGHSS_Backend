// src/services/pacienteService.js

import prisma from '../config/prismaClient.js';
import AppError from '../utils/AppError.js';
import bcrypt from 'bcryptjs';

const pacienteService = {
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

  listarTodos: async () => {
    return prisma.paciente.findMany({
      select: { id: true, nome: true, cpf: true, tipoCliente: true },
    });
  },

  buscarPorId: async (id) => {
    return prisma.paciente.findUnique({
      where: { id },
      include: { usuario: { select: { email: true } } },
    });
  },

  atualizar: async (id, dados) => {
    return prisma.paciente.update({
      where: { id },
      data: dados,
    });
  },

  deletar: async (id) => {
    // Atenção: num sistema real, talvez não queira apagar um paciente, mas sim "inativá-lo".
    // Também seria preciso apagar o usuário associado numa transação. Por simplicidade, vamos apagar.
    const paciente = await prisma.paciente.findUnique({ where: { id } });
    if (!paciente) throw new AppError(404, 'Paciente não encontrado para exclusão.');

    return prisma.$transaction(async (tx) => {
        await tx.paciente.delete({ where: { id } });
        await tx.usuario.delete({ where: { id: paciente.usuarioId } });
    });
  },
  
  buscarPorUsuarioId: async (usuarioId) => {
    return prisma.paciente.findUnique({
      where: { usuarioId: usuarioId },
      include: { usuario: { select: { email: true } } },
    });
  },

  atualizarMeuPerfil: async (usuarioId, dadosParaAtualizar) => {
    // Verifica se o usuário é um paciente
    const paciente = await prisma.paciente.findUnique({
      where: { usuarioId: usuarioId },
      select: { id: true }
    });

    if (!paciente) {
      throw new AppError(404, 'Perfil de paciente não encontrado para este utilizador.');
    }

    const pacienteAtualizado = await prisma.paciente.update({
      where: { id: paciente.id },
      data: dadosParaAtualizar,
    });

    return pacienteAtualizado;
  },

};

export default pacienteService;