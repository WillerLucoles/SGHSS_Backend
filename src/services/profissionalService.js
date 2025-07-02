// src/services/profissionalService.js

// --- BLOCO DE IMPORTAÇÕES ---
import prisma from '../config/prismaClient.js';

// --- SERVIÇO (exportado como um objeto default) ---
const profissionalService = {
  listarTodos: async () => {
    // No nosso novo schema, o modelo é 'Profissional', não 'ProfissionalDeSaude'.
    // Vamos ajustar para refletir o schema que criámos.
    return await prisma.profissional.findMany();
  },

  buscarPorId: async (id) => {
    return await prisma.profissional.findUnique({
      where: { id: id }, // O ID agora é String (UUID), não precisamos converter para Number.
    });
  },

  // A função de criar será mais complexa, pois envolve criar um Usuário também.
  // Vamos deixar um esqueleto aqui e implementá-la corretamente depois.
  criar: async (dados) => {
    // Lógica a ser implementada: criar Usuário e Profissional numa transação.
    console.log('Dados para criar profissional:', dados);
    // return await prisma.profissional.create({ data: dados });
    throw new Error('Função de criar profissional ainda não implementada com a nova lógica.');
  },

  atualizar: async (id, dados) => {
    return await prisma.profissional.update({
      where: { id: id },
      data: dados,
    });
  },

  deletar: async (id) => {

    return await prisma.profissional.delete({
      where: { id: id },
    });
  },
};

// --- EXPORTAÇÃO ---
export default profissionalService;