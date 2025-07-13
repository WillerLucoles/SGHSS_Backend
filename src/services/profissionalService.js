// src/services/profissionalService.js

import prisma from '../config/prismaClient.js';
import AppError from '../utils/AppError.js';
import bcrypt from 'bcryptjs';

const profissionalService = {
  // --- FUNÇÕES /me PARA O PROFISSIONAL LOGADO ---

  /**
   * Busca o perfil de um profissional com base no ID do seu usuário de login.
   * @param {string} usuarioId - O ID do usuário logado.
   * @returns {Promise<object>} O perfil do profissional encontrado.
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
   */
  atualizarMeuPerfil: async (usuarioId, dadosParaAtualizar) => {
    // Encontrar o ID do profissional que corresponde ao ID do utilizador
    const profissional = await prisma.profissional.findUnique({
      where: { usuarioId },
      select: { id: true },
    });

    if (!profissional) {
      throw new AppError(404, 'Perfil de profissional não encontrado para este utilizador.');
    }

    // Usar o ID do profissional para atualizar os seus dados
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

  listarTodos: async () => {
    return prisma.profissional.findMany({
      // Selecionar campos específicos para não expor tudo na listagem geral
      select: { id: true, nome: true, especialidadePrincipal: true },
    });
  },

  buscarPorId: async (id) => {
    const profissional = await prisma.profissional.findUnique({
      where: { id: id },
    });
    // Se não encontrar, o serviço lança o erro, centralizando a lógica.
    if (!profissional) {
      throw new AppError(404, 'Profissional com o ID especificado não encontrado.');
    }
    return profissional;
  },

  atualizar: async (id, dados) => {
    // A função update do Prisma já lança um erro (P2025) se o ID não for encontrado
    return prisma.profissional.update({
      where: { id: id },
      data: dados,
    });
  },

  deletar: async (id) => {
    const profissional = await prisma.profissional.findUnique({ where: { id } });
    if (!profissional) throw new AppError(404, 'Profissional não encontrado para exclusão.');

    return prisma.$transaction(async (tx) => {
      // É importante apagar o profissional primeiro por causa da chave estrangeira no usuário (se aplicável).
      await tx.profissional.delete({ where: { id } });
      await tx.usuario.delete({ where: { id: profissional.usuarioId } });
    });
  },

  listarDisponibilidadePorDia: async ({ profissionalId, data }) => {
    // 1. Encontrar o profissional, as suas grades horárias e indisponibilidades
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

    // 2. Encontrar a grade horária para o dia da semana solicitado
    const gradeDoDia = profissional.gradeHoraria.find(
      (g) => g.diaDaSemana === diaDaSemana
    );
    if (!gradeDoDia) return []; // Se não trabalha, retorna vazio

    // 3. Criar a "agenda virtual" do dia
    const slotsDoDia = [];
    const { horaInicio, horaFim, duracaoConsultaMinutos } = gradeDoDia;
    const diaString = dataAlvo.toISOString().split('T')[0];
    
    let slotAtualUTC = new Date(`${diaString}T${horaInicio}:00.000Z`);
    const fimDoTrabalhoUTC = new Date(`${diaString}T${horaFim}:00.000Z`);

    while (slotAtualUTC < fimDoTrabalhoUTC) {
      slotsDoDia.push(new Date(slotAtualUTC));
      slotAtualUTC.setUTCMinutes(slotAtualUTC.getUTCMinutes() + duracaoConsultaMinutos);
    }
    
    // 4. Filtrar os slots que já estão ocupados
    const horariosLivres = slotsDoDia.filter(slot => {
      // Verifica se o slot está dentro de uma indisponibilidade (almoço, reunião)
      const estaIndisponivel = profissional.indisponibilidades.some(ind => 
        slot >= ind.inicio && slot < ind.fim
      );
      if (estaIndisponivel) return false;

      // Verifica se já existe uma consulta agendada para este slot
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