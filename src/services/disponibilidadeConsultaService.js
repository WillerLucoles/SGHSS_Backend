// src/services/disponibilidadeConsultaService.js

// --- BLOCO DE IMPORTAÇÕES ---
import prisma from '../config/prismaClient.js';

// --- FUNÇÕES DO SERVIÇO ---
// Exportamos cada função de forma nomeada

// ATENÇÃO: Esta função precisará ser ajustada para a nossa nova lógica de
// 'HorarioPadrao' e 'JanelaDeAtendimento', mas por enquanto vamos apenas
// modernizar a sintaxe.
export async function criar({ profissionalId, diaSemana, inicio, fim }) {
  // O modelo antigo era 'disponibilidadeProfissional'. No nosso novo schema,
  // isto será substituído pela criação de 'HorarioPadrao'.
  // Por enquanto, vamos manter a lógica antiga para não quebrar nada.
  return prisma.disponibilidadeProfissional.create({
    data: { profissionalId, diaSemana, inicio, fim },
  });
}

export async function listarPorProfissional(profissionalId) {
  return prisma.disponibilidadeProfissional.findMany({
    where: { profissionalId },
  });
}