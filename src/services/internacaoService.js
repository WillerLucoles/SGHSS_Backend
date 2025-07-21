// src/services/internacaoService.js

import prisma from '../config/prismaClient.js';
import AppError from '../utils/AppError.js';

/**
 * Serviço responsável pelas operações de internação hospitalar.
 * Implementa regras de negócio para criação de internações, incluindo validações de compatibilidade de paciente, leito e profissional.
 */
const internacaoService = {
  /**
   * Cria uma nova internação, validando compatibilidade de leito, paciente e profissional.
   * @param {Object} dados - Dados da internação.
   * @throws {AppError} Se houver qualquer inconsistência ou violação de regra de negócio.
   * @returns {Promise<Object>} Internação criada.
   */
  criar: async (dados) => {
    const { pacienteId, leitoId, profissionalId, ...dadosRestantes } = dados;

    // Busca o leito e o paciente para validações de compatibilidade.
    const leito = await prisma.leito.findUnique({
      where: { id: leitoId },
      include: { quarto: true },
    });
    const paciente = await prisma.paciente.findUnique({
      where: { id: pacienteId },
    });

    // Valida existência dos registros e disponibilidade do leito.
    if (!leito) throw new AppError(404, 'Leito não encontrado.');
    if (!paciente) throw new AppError(404, 'Paciente não encontrado.');
    if (leito.status !== 'LIVRE') {
      throw new AppError(409, `Este leito não está livre. Status atual: ${leito.status}`);
    }

    // Validação de compatibilidade entre paciente e categoria do quarto.
    const categoriaQuarto = leito.quarto.categoria;

    // Regra: Quartos masculinos/femininos só aceitam pacientes do mesmo gênero.
    if (categoriaQuarto === 'MASCULINO' && paciente.genero !== 'MASCULINO') {
      throw new AppError(409, 'Este quarto é destinado apenas a pacientes do sexo masculino.');
    }
    if (categoriaQuarto === 'FEMININO' && paciente.genero !== 'FEMININO') {
      throw new AppError(409, 'Este quarto é destinado apenas a pacientes do sexo feminino.');
    }

    // Regra: Quartos pediátricos aceitam apenas menores de 18 anos.
    if (categoriaQuarto === 'PEDIATRICO') {
      const hoje = new Date();
      const nascimento = new Date(paciente.dataNascimento);
      let idade = hoje.getFullYear() - nascimento.getFullYear();
      const mes = hoje.getMonth() - nascimento.getMonth();
      if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
      }
      if (idade >= 18) {
        throw new AppError(409, 'Este quarto é destinado apenas a pacientes pediátricos (menores de 18 anos).');
      }
    }
    // Categorias como 'ISOLAMENTO' e 'UTI_GERAL' são consideradas mistas.

    // Valida existência do profissional responsável.
    const profissionalResponsavel = await prisma.profissional.findUnique({
      where: { id: profissionalId },
    });
    if (!profissionalResponsavel) throw new AppError(404, 'O profissional responsável especificado não foi encontrado.');

    // Transação: atualiza status do leito e cria a internação.
    return prisma.$transaction(async (tx) => {
      await tx.leito.update({
        where: { id: leitoId },
        data: { status: 'OCUPADO' },
      });

      const novaInternacao = await tx.internacao.create({
        data: {
          ...dadosRestantes,
          pacienteId,
          leitoId,
          profissionalId,
        },
      });

      return novaInternacao;
    });
  },
};

export default internacaoService;