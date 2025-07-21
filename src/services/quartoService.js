// src/services/quartoService.js

import prisma from '../config/prismaClient.js';
import AppError from '../utils/AppError.js';

/**
 * Serviço responsável pelas operações relacionadas a quartos hospitalares.
 * Implementa regras de negócio para criação, listagem, atualização, exclusão e consulta de quartos.
 */
const quartoService = {
  /**
   * Cria um novo quarto.
   * @param {Object} dados - Dados do quarto a ser criado.
   * @throws {AppError} Se o número do quarto já existir.
   * @returns {Promise<Object>} Quarto criado.
   */
  criar: async (dados) => {
    try {
      return await prisma.quarto.create({ data: dados });
    } catch (error) {
      // Trata erro de unicidade para número do quarto.
      if (error.code === 'P2002' && error.meta?.target?.includes('numeroQuarto')) {
        throw new AppError(409, 'O número deste quarto já existe.');
      }
      throw error;
    }
  },

  /**
   * Lista todos os quartos, incluindo a contagem de leitos associados.
   * @returns {Promise<Array>} Lista de quartos.
   */
  listarTodos: async () => {
    return prisma.quarto.findMany({
      include: { _count: { select: { leitos: true } } },
    });
  },

  /**
   * Busca um quarto pelo seu ID, incluindo os leitos associados.
   * @param {number} id - ID do quarto.
   * @throws {AppError} Se o quarto não for encontrado.
   * @returns {Promise<Object>} Quarto encontrado.
   */
  buscarPorId: async (id) => {
    const quarto = await prisma.quarto.findUnique({
      where: { id },
      include: { leitos: true },
    });
    if (!quarto) {
      throw new AppError(404, 'Quarto não encontrado.');
    }
    return quarto;
  },

  /**
   * Atualiza os dados de um quarto existente.
   * @param {number} id - ID do quarto.
   * @param {Object} dados - Dados para atualização.
   * @throws {AppError} Se o quarto não for encontrado.
   * @returns {Promise<Object>} Quarto atualizado.
   */
  atualizar: async (id, dados) => {
    try {
      return await prisma.quarto.update({ where: { id }, data: dados });
    } catch (error) {
      // Trata erro de não encontrado.
      if (error.code === 'P2025') {
        throw new AppError(404, 'Quarto não encontrado para atualização.');
      }
      throw error;
    }
  },

  /**
   * Remove um quarto, desde que não possua leitos associados.
   * @param {number} id - ID do quarto.
   * @throws {AppError} Se o quarto não existir ou possuir leitos associados.
   * @returns {Promise<Object>} Quarto removido.
   */
  deletar: async (id) => {
    // Busca o quarto para garantir existência e verificar se possui leitos.
    const quarto = await prisma.quarto.findUnique({
      where: { id },
      include: { leitos: true },
    });
    if (!quarto) {
      throw new AppError(404, 'Quarto não encontrado para exclusão.');
    }
    // Regra de negócio: não se pode apagar um quarto que ainda tem leitos.
    if (quarto.leitos.length > 0) {
      throw new AppError(409, 'Não é possível apagar um quarto que ainda possui leitos associados.');
    }
    return prisma.quarto.delete({ where: { id } });
  },
};

export default quartoService;