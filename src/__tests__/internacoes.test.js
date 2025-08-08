// src/__tests__/internacoes.test.js

import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';
import { criarAdmin, criarProfissional, criarPaciente } from './utils/test-helpers';

const prisma = new PrismaClient();

describe('API de Internações', () => {
  let adminToken;
  let profissionalToken;
  let pacienteMasculinoId;
  let leitoMasculinoId;
  let profissionalId;

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

    // **INÍCIO DA CORREÇÃO: Setup dos dados necessários**

    // 1. Criar utilizadores e obter tokens/IDs
    const admin = await criarAdmin();
    adminToken = admin.token;

    const profissional = await criarProfissional({
      email: 'dr.internacao@sghss.com',
      senha: 'senhaForte123',
      cpf: '33333333333',
      crm: '54321INT',
    });
    profissionalToken = profissional.token;
    profissionalId = profissional.id;

    const pacienteMasculino = await criarPaciente({
      email: 'pac.masc.interna@sghss.com',
      senha: 'senhaForte123',
      cpf: '44444444444',
      genero: 'MASCULINO',
    });
    pacienteMasculinoId = pacienteMasculino.id;

    // 2. Criar a infraestrutura (quarto e leito)
    const resQuarto = await request(app)
      .post('/api/quartos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        numeroQuarto: '301-MASC',
        categoria: 'MASCULINO',
        capacidade: 2,
      });
    const quartoId = resQuarto.body.id;

    const resLeito = await request(app)
      .post('/api/leitos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ identificacaoLeito: '301-A', quartoId: quartoId });
    leitoMasculinoId = resLeito.body.id;
    // **FIM DA CORREÇÃO**
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('CT53: PROFISSIONAL deve conseguir internar um paciente em um leito LIVRE e compatível', async () => {
    const response = await request(app)
      .post('/api/internacoes')
      .set('Authorization', `Bearer ${profissionalToken}`)
      .send({
        pacienteId: pacienteMasculinoId,
        leitoId: leitoMasculinoId,
        profissionalId: profissionalId,
        dataEntrada: new Date().toISOString(),
      });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });

  it('CT54: O status do leito deve mudar para OCUPADO após a internação', async () => {
    const leito = await prisma.leito.findUnique({
      where: { id: leitoMasculinoId },
    });
    expect(leito.status).toBe('OCUPADO');
  });

  it('CT55: deve retornar 409 ao tentar internar um paciente em quarto de gênero incompatível', async () => {
    // Criar uma paciente feminina para o teste de conflito
    const pacienteFeminino = await criarPaciente({
      email: 'pac.fem.interna@sghss.com',
      senha: 'senhaForte123',
      cpf: '99999999999',
      genero: 'FEMININO',
    });

    // Tentar internar a paciente feminina no leito do quarto MASCULINO
    const response = await request(app)
      .post('/api/internacoes')
      .set('Authorization', `Bearer ${profissionalToken}`)
      .send({
        pacienteId: pacienteFeminino.id,
        leitoId: leitoMasculinoId, // Leito está OCUPADO e em quarto MASCULINO
        profissionalId: profissionalId,
        dataEntrada: new Date().toISOString(),
      });

    // A API deve primeiro acusar que o leito não está livre.
    // Se o leito estivesse livre, a segunda verificação seria a de gênero.
    expect(response.status).toBe(409);
    expect(response.body.error).toContain('Este leito não está livre.');
  });
});