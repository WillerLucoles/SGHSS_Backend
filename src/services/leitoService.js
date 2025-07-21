// src/services/leitoService.js

import prisma from '../config/prismaClient.js';
import AppError from '../utils/AppError.js';

/**
 * Serviço responsável pelas operações relacionadas a leitos hospitalares.
 * Inclui regras de negócio para criação, listagem, atualização, exclusão e consulta de status.
 */
const leitoService = {
  /**
   * Cria um novo leito em um quarto, respeitando a capacidade máxima do quarto.
   * @param {Object} dados - Dados do leito a ser criado.
   * @throws {AppError} Se o quarto não existir ou já estiver na capacidade máxima.
   * @returns {Promise<Object>} Leito criado.
   */
  criar: async (dados) => {
    // Busca o quarto para garantir existência e verificar capacidade.
    const quarto = await prisma.quarto.findUnique({
      where: { id: dados.quartoId },
      include: { _count: { select: { leitos: true } } },
    });
    if (!quarto) {
      throw new AppError(404, 'Quarto não encontrado para associar o leito.');
    }
    if (quarto._count.leitos >= quarto.capacidade) {
      throw new AppError(409, 'A capacidade máxima do quarto já foi atingida.');
    }
    // Cria o leito se as regras forem atendidas.
    return prisma.leito.create({ data: dados });
  },

  /**
   * Lista todos os leitos, incluindo informações básicas do quarto.
   * @returns {Promise<Array>} Lista de leitos.
   */
  listarTodos: async () => {
    return prisma.leito.findMany({
      include: { quarto: { select: { numeroQuarto: true, categoria: true } } },
    });
  },

  /**
   * Busca um leito pelo seu ID, incluindo dados completos do quarto.
   * @param {number} id - ID do leito.
   * @throws {AppError} Se o leito não for encontrado.
   * @returns {Promise<Object>} Leito encontrado.
   */
  buscarPorId: async (id) => {
    const leito = await prisma.leito.findUnique({
      where: { id },
      include: { quarto: true },
    });
    if (!leito) {
      throw new AppError(404, 'Leito não encontrado.');
    }
    return leito;
  },

  /**
   * Atualiza os dados de um leito existente.
   * @param {number} id - ID do leito.
   * @param {Object} dados - Dados para atualização.
   * @throws {AppError} Se o leito não for encontrado.
   * @returns {Promise<Object>} Leito atualizado.
   */
  atualizar: async (id, dados) => {
    try {
      return await prisma.leito.update({ where: { id }, data: dados });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new AppError(404, 'Leito não encontrado para atualização.');
      }
      throw error;
    }
  },

  /**
   * Remove um leito, desde que não esteja ocupado.
   * @param {number} id - ID do leito.
   * @throws {AppError} Se o leito não existir ou estiver ocupado.
   * @returns {Promise<Object>} Leito removido.
   */
  deletar: async (id) => {
    // Regra de negócio: não se pode apagar um leito que está ocupado.
    const leito = await prisma.leito.findUnique({ where: { id } });
    if (!leito) {
      throw new AppError(404, 'Leito não encontrado para exclusão.');
    }
    if (leito.status === 'OCUPADO') {
      throw new AppError(409, 'Não é possível apagar um leito que está atualmente ocupado.');
    }
    return prisma.leito.delete({ where: { id } });
  },

  /**
   * Obtém o panorama dos leitos, podendo filtrar por categoria do quarto.
   * Inclui informações do quarto e da internação ativa, se houver.
   * @param {string} [categoria] - Categoria do quarto para filtro opcional.
   * @returns {Promise<Array>} Lista de leitos com status detalhado.
   */
  obterStatusDeLeitos: async (categoria) => {
    const whereClause = {};

    // Aplica filtro por categoria, se fornecido.
    if (categoria) {
      whereClause.quarto = {
        categoria: categoria,
      };
    }

    // Busca leitos, quartos e internações ativas associadas.
    const leitos = await prisma.leito.findMany({
      where: whereClause,
      include: {
        quarto: {
          select: {
            numeroQuarto: true,
            categoria: true,
          },
        },
        internacao: {
          where: {
            status: 'ATIVA',
          },
          include: {
            paciente: {
              select: {
                nome: true,
              },
            },
          },
        },
      },
      orderBy: {
        quarto: {
          numeroQuarto: 'asc'
        }
      }
    });

    // Mapeia o resultado para o formato esperado pelo frontend.
    const panorama = leitos.map(leito => {
      // Garante que só acessa a internação ativa se existir.
      const internacaoAtiva = leito.internacao && leito.internacao.length > 0
        ? leito.internacao[0]
        : null;

      return {
        id: leito.id,
        identificacaoLeito: leito.identificacaoLeito,
        status: leito.status,
        quarto: leito.quarto,
        internacaoAtual: internacaoAtiva ? {
          paciente: internacaoAtiva.paciente.nome,
          dataEntrada: internacaoAtiva.dataEntrada,
          dataPrevistaAlta: internacaoAtiva.dataPrevistaAlta,
        } : null,
      };
    });

    return panorama;
  },

};

export default leitoService;