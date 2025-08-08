// src/__tests__/leitos.test.js

import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';
import { criarAdmin } from './utils/test-helpers';

const prisma = new PrismaClient();

describe('API de Leitos', () => {
  let adminToken;
  let quartoId;

  beforeAll(async () => {
    // A ordem de exclusão é crucial para respeitar as chaves estrangeiras
    await prisma.$transaction([
      prisma.anexoClinico.deleteMany({}),
      prisma.registroClinico.deleteMany({}),
      prisma.consultas.deleteMany({}),
      prisma.indisponibilidade.deleteMany({}),
      prisma.gradeHoraria.deleteMany({}),
      prisma.internacao.deleteMany({}),
      prisma.leito.deleteMany({}),
      prisma.quarto.deleteMany({}),
      prisma.paciente.deleteMany({}),
      prisma.profissional.deleteMany({}),
      prisma.administrador.deleteMany({}),
      prisma.usuario.deleteMany({}),
    ]);

    // 1. Criar e autenticar o utilizador administrador para obter o token
    const admin = await criarAdmin();
    adminToken = admin.token;

    // 2. Criar um quarto para poder associar leitos a ele nos testes
    const responseQuarto = await request(app)
      .post('/api/quartos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        numeroQuarto: '201-TESTE',
        categoria: 'MASCULINO',
        capacidade: 1, // Capacidade de 1 para testar o limite
      });
    quartoId = responseQuarto.body.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('CT50: ADMIN deve conseguir criar um leito em um quarto com capacidade', async () => {
    const response = await request(app)
      .post('/api/leitos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ identificacaoLeito: '201-A', quartoId });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.quartoId).toBe(quartoId);
  });

  it('CT51: deve retornar 409 ao tentar criar leito em quarto com capacidade máxima atingida', async () => {
    // O quarto foi criado com capacidade 1 e o teste anterior já criou um leito.
    // Esta segunda tentativa deve falhar.
    const response = await request(app)
      .post('/api/leitos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ identificacaoLeito: '201-B', quartoId });
    expect(response.status).toBe(409);
    expect(response.body.error).toBe(
      'A capacidade máxima do quarto já foi atingida.'
    );
  });
});