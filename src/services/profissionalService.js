// src/services/profissionalService.js

import prisma from '../config/prismaClient.js';
import AppError from '../utils/AppError.js';
import bcrypt from 'bcryptjs';

/**
 * Serviço responsável pelas operações relacionadas a profissionais de saúde.
 * Inclui registro, atualização, consulta, exclusão e listagem de disponibilidade.
 */
const profissionalService = {
  // --- FUNÇÕES /me PARA O PROFISSIONAL LOGADO ---

  /**
   * Busca o perfil de um profissional com base no ID do seu usuário de login.
   * @param {string} usuarioId - O ID do usuário logado.
   * @returns {Promise<object>} O perfil do profissional encontrado.
   * @throws {AppError} Se não encontrar o profissional.
   */
  buscarPorUsuarioId: async (usuarioId) => {
    const profissional = await prisma.profissional.findUnique({
      where: { usuarioId },
      include: {
        usuario: { select: { email: true, role: true } },
      },
    });

    if (!profissional) {
      throw new AppError(404, 'Perfil de profissional não encontrado para este utilizador.');
    }
    return profissional;
  },

  /**
   * Atualiza os dados do perfil de um profissional logado.
   * @param {string} usuarioId - O ID do usuário logado.
   * @param {object} dadosParaAtualizar - Os dados a serem atualizados.
   * @returns {Promise<object>} O perfil do profissional atualizado.
   * @throws {AppError} Se não encontrar o profissional.
   */
  atualizarMeuPerfil: async (usuarioId, dadosParaAtualizar) => {
    const profissional = await prisma.profissional.findUnique({
      where: { usuarioId },
      select: { id: true },
    });

    if (!profissional) {
      throw new AppError(404, 'Perfil de profissional não encontrado para este utilizador.');
    }

    return prisma.profissional.update({
      where: { id: profissional.id },
      data: dadosParaAtualizar,
    });
  },

  // --- FUNÇÕES ADMINISTRATIVAS ---

  /**
   * Cria um novo profissional e o seu usuário de login associado.
   * @param {object} dadosProfissional - Dados completos do profissional, incluindo email e senha.
   * @returns {Promise<object>} O novo profissional criado.
   * @throws {AppError} Se email, CPF ou CRM já estiverem cadastrados.
   */
  criar: async (dadosProfissional) => {
    const { email, senha, cpf, crm, ...outrosDados } = dadosProfissional;

    const conflitoEmail = await prisma.usuario.findUnique({ where: { email } });
    if (conflitoEmail) throw new AppError(409, 'Este email já está em uso.');

    const conflitoCpf = await prisma.profissional.findUnique({ where: { cpf } });
    if (conflitoCpf) throw new AppError(409, 'Este CPF já pertence a um profissional.');

    const conflitoCrm = await prisma.profissional.findUnique({ where: { crm } });
    if (conflitoCrm) throw new AppError(409, 'Este CRM já pertence a um profissional.');

    const senhaHash = await bcrypt.hash(senha, 8);

    return prisma.$transaction(async (tx) => {
      const novoUsuario = await tx.usuario.create({
        data: { email, senha: senhaHash, role: 'PROFISSIONAL' },
      });
      const profissionalCriado = await tx.profissional.create({
        data: { ...outrosDados, cpf, crm, usuarioId: novoUsuario.id },
      });
      return profissionalCriado;
    });
  },

  /**
   * Lista todos os profissionais (campos resumidos).
   * @returns {Promise<Array>} Lista de profissionais.
   */
  listarTodos: async () => {
    return prisma.profissional.findMany({
      select: { id: true, nome: true, especialidadePrincipal: true },
    });
  },

  /**
   * Busca um profissional pelo ID.
   * @param {number} id - ID do profissional.
   * @returns {Promise<object>} Profissional encontrado.
   * @throws {AppError} Se não encontrar o profissional.
   */
  buscarPorId: async (id) => {
    const profissional = await prisma.profissional.findUnique({
      where: { id: id },
    });
    if (!profissional) {
      throw new AppError(404, 'Profissional com o ID especificado não encontrado.');
    }
    return profissional;
  },

  /**
   * Atualiza os dados de um profissional.
   * @param {number} id - ID do profissional.
   * @param {object} dados - Dados para atualização.
   * @returns {Promise<object>} Profissional atualizado.
   */
  atualizar: async (id, dados) => {
    return prisma.profissional.update({
      where: { id: id },
      data: dados,
    });
  },

  /**
   * Remove um profissional e o usuário associado.
   * @param {number} id - ID do profissional.
   * @throws {AppError} Se não encontrar o profissional.
   * @returns {Promise<void>}
   */
  deletar: async (id) => {
    const profissional = await prisma.profissional.findUnique({ where: { id } });
    if (!profissional) throw new AppError(404, 'Profissional não encontrado para exclusão.');

    return prisma.$transaction(async (tx) => {
      await tx.profissional.delete({ where: { id } });
      await tx.usuario.delete({ where: { id: profissional.usuarioId } });
    });
  },

  /**
   * Lista os horários livres do profissional para um dia específico.
   * @param {object} params - { profissionalId, data }
   * @returns {Promise<Array>} Lista de horários livres (Date).
   * @throws {AppError} Se não encontrar o profissional.
   */
  listarDisponibilidadePorDia: async ({ profissionalId, data }) => {
    const profissional = await prisma.profissional.findUnique({
      where: { id: profissionalId },
      include: {
        gradeHoraria: true,
        indisponibilidades: true,
        consultas: true,
      },
    });
    if (!profissional) throw new AppError(404, 'Profissional não encontrado.');

    const dataAlvo = new Date(`${data}T00:00:00.000Z`);
    const diaDaSemana = dataAlvo.getUTCDay();

    const gradeDoDia = profissional.gradeHoraria.find(
      (g) => g.diaDaSemana === diaDaSemana
    );
    if (!gradeDoDia) return [];

    const slotsDoDia = [];
    const { horaInicio, horaFim, duracaoConsultaMinutos } = gradeDoDia;
    const diaString = dataAlvo.toISOString().split('T')[0];

    let slotAtualUTC = new Date(`${diaString}T${horaInicio}:00.000Z`);
    const fimDoTrabalhoUTC = new Date(`${diaString}T${horaFim}:00.000Z`);

    while (slotAtualUTC < fimDoTrabalhoUTC) {
      slotsDoDia.push(new Date(slotAtualUTC));
      slotAtualUTC.setUTCMinutes(slotAtualUTC.getUTCMinutes() + duracaoConsultaMinutos);
    }

    // Filtra slots ocupados por indisponibilidade ou consulta agendada
    const horariosLivres = slotsDoDia.filter(slot => {
      const estaIndisponivel = profissional.indisponibilidades.some(ind =>
        slot >= ind.inicio && slot < ind.fim
      );
      if (estaIndisponivel) return false;

      const temConsulta = profissional.consultas.some(consulta =>
        consulta.dataHoraInicio.getTime() === slot.getTime()
      );
      if (temConsulta) return false;

      return true;
    });

    return horariosLivres;
  },
};

export default profissionalService;