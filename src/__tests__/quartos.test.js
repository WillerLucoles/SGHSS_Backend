// src/__tests__/quartos.test.js

import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';
import { criarAdmin, criarProfissional } from './utils/test-helpers';

const prisma = new PrismaClient();

describe('API de Quartos', () => {
  let adminToken;
  let profissionalToken;

  // Usamos beforeAll para criar os utilizadores uma vez, pois é uma operação mais lenta
  beforeAll(async () => {
    const admin = await criarAdmin();
    adminToken = admin.token;
    
    const profissional = await criarProfissional({ 
      email: 'prof.quartos@sghss.com', 
      senha: 'senhaValida123', 
      cpf: '12345678900', 
      crm: '12345SP' 
    });
    profissionalToken = profissional.token;
  });

  // Usamos beforeEach para limpar as tabelas de dados antes de CADA teste
  beforeEach(async () => {
    await prisma.leito.deleteMany({});
    await prisma.quarto.deleteMany({});
  });

  afterAll(async () => {
    // Limpeza final dos utilizadores e desconexão
    await prisma.$transaction([
      prisma.paciente.deleteMany({}),
      prisma.profissional.deleteMany({}),
      prisma.administrador.deleteMany({}),
      prisma.usuario.deleteMany({}),
    ]);
    await prisma.$disconnect();
  });

  it('CT47: ADMIN deve conseguir CRIAR um quarto', async () => {
    const response = await request(app)
      .post('/api/quartos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ numeroQuarto: '101', categoria: 'PARTICULAR', capacidade: 2 });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });

  it('CT48: PROFISSIONAL não deve conseguir criar um quarto', async () => {
    const response = await request(app)
      .post('/api/quartos')
      .set('Authorization', `Bearer ${profissionalToken}`)
      .send({ numeroQuarto: '102', categoria: 'ENFERMARIA', capacidade: 4 });
    expect(response.status).toBe(403);
  });
  
  it('CT49: não deve ser possível deletar um quarto com leitos associados', async () => {
    // Passo 1: Criar o quarto necessário para este teste específico
    const resQuarto = await request(app)
      .post('/api/quartos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ numeroQuarto: '103', categoria: 'UTI_GERAL', capacidade: 1 });
    const quartoId = resQuarto.body.id;

    // Passo 2: Criar o leito associado ao quarto
    await prisma.leito.create({
        data: { identificacaoLeito: '103-A', quartoId: quartoId }
    });

    // Passo 3: Tentar deletar o quarto
    const response = await request(app)
      .delete(`/api/quartos/${quartoId}`)
      .set('Authorization', `Bearer ${adminToken}`);
      
    expect(response.status).toBe(409);
  });
});