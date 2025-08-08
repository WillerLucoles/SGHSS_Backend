// src/__tests__/leitos.test.js

import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';
import { criarAdmin} from './utils/test-helpers';

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
  });

  it('CT51: deve retornar 409 ao tentar criar leito em quarto com capacidade máxima atingida', async () => {
    const response = await request(app)
      .post('/api/leitos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ identificacaoLeito: '201-B', quartoId });
    expect(response.status).toBe(409);
  });
});