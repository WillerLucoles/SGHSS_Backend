// src/services/internacaoService.js

import prisma from '../config/prismaClient.js';
import AppError from '../utils/AppError.js';

/**
 * Serviço responsável pelas operações de internação hospitalar.
 * Implementa regras de negócio para criação de internações, validações de compatibilidade e registros clínicos.
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

    // Quartos masculinos/femininos só aceitam pacientes do mesmo gênero.
    if (categoriaQuarto === 'MASCULINO' && paciente.genero !== 'MASCULINO') {
      throw new AppError(409, 'Este quarto é destinado apenas a pacientes do sexo masculino.');
    }
    if (categoriaQuarto === 'FEMININO' && paciente.genero !== 'FEMININO') {
      throw new AppError(409, 'Este quarto é destinado apenas a pacientes do sexo feminino.');
    }

    // Quartos pediátricos aceitam apenas menores de 18 anos.
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

  /**
   * Adiciona um registro clínico a uma internação ativa, com possibilidade de anexos.
   * @param {Object} params - { internacaoId, profissionalUsuarioId, dadosDoRegistro }
   * @throws {AppError} Se a internação não existir, não estiver ativa ou o profissional não existir.
   * @returns {Promise<Object>} Registro clínico criado, incluindo anexos.
   */
  adicionarRegistro: async ({ internacaoId, profissionalUsuarioId, dadosDoRegistro }) => {
    const { anexos, ...dadosPrincipais } = dadosDoRegistro;

    // Valida existência da internação e se está ativa
    const internacao = await prisma.internacao.findUnique({
      where: { id: internacaoId },
    });
    if (!internacao) throw new AppError(404, 'Internação não encontrada.');
    if (internacao.status !== 'ATIVA') {
      throw new AppError(409, 'Só é possível adicionar registros a uma internação ativa.');
    }

    // Valida existência do profissional logado
    const profissional = await prisma.profissional.findUnique({
      where: { usuarioId: profissionalUsuarioId },
    });
    if (!profissional) throw new AppError(404, 'Profissional não encontrado.');

    // Transação: cria o registro clínico e os anexos (se existirem)
    return prisma.$transaction(async (tx) => {
      const novoRegistro = await tx.registroClinico.create({
        data: {
          ...dadosPrincipais,
          internacaoId: internacaoId,
          profissionalId: profissional.id,
        },
      });

      // Se houver anexos, cria os registros de anexo vinculados ao registro clínico
      if (anexos && anexos.length > 0) {
        const dadosAnexos = anexos.map(anexo => ({
          ...anexo,
          urlArquivoSimulado: `/uploads/simulado/${anexo.nomeArquivo.replace(/\s/g, '_')}`,
          registroClinicoId: novoRegistro.id,
        }));
        await tx.anexoClinico.createMany({ data: dadosAnexos });
      }

      // Retorna o registro completo com os anexos para confirmação
      return tx.registroClinico.findUnique({
        where: { id: novoRegistro.id },
        include: { anexos: true },
      });
    });
  },
};

export default internacaoService;