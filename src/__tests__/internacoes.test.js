// src/__tests__/internacoes.test.js

import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';
import { criarProfissional, criarPaciente } from './utils/test-helpers';

const prisma = new PrismaClient();

describe('API de Internações', () => {
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
  });


  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('CT53: PROFISSIONAL deve conseguir internar um paciente em um leito LIVRE', async () => {
    const response = await request(app)
      .post('/api/internacoes')
      .set('Authorization', `Bearer ${profissionalToken}`)
      .send({
        pacienteId: pacienteMasculinoId,
        leitoId: leitoMasculinoId,
        profissionalId: profissionalId,
        dataEntrada: new Date().toISOString()
      });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });

  it('CT54: O status do leito deve mudar para OCUPADO após a internação', async () => {
    const leito = await prisma.leito.findUnique({ where: { id: leitoMasculinoId }});
    expect(leito.status).toBe('OCUPADO');
  });

   it('CT55: deve retornar 409 ao tentar internar um paciente em quarto de gênero incompatível', async () => {
     const pacienteFeminino = await criarPaciente({
        email: 'pac.fem.interna@sghss.com', senha: '123', cpf: '999', genero: 'FEMININO'
     });

     const response = await request(app)
      .post('/api/internacoes')
      .set('Authorization', `Bearer ${profissionalToken}`)
      .send({
        pacienteId: pacienteFeminino.id,
        leitoId: leitoMasculinoId,
        profissionalId: profissionalId,
        dataEntrada: new Date().toISOString()
      });
     expect(response.status).toBe(409);
   });
});