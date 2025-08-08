// src/__tests__/profissionais.test.js

import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';
import { criarAdmin, criarProfissional, criarPaciente } from './utils/test-helpers';

const prisma = new PrismaClient();

describe('API de Profissionais', () => {
  let adminToken;
  let profissionalToken;
  let pacienteToken;
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
  describe('POST /api/profissionais', () => {
    it('CT22: deve permitir que um ADMIN crie um novo profissional', async () => {
      const response = await request(app)
        .post('/api/profissionais')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nome: 'Dr. James Wilson',
          cpf: '99988877766',
          crm: '54321MG',
          ufCrm: 'MG',
          especialidadePrincipal: 'Oncologia',
          telefone: '31988887777',
          email: 'dr.wilson@sghss.com',
          senha: 'senhaForte123',
        });
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.nome).toBe('Dr. James Wilson');
    });

    it('CT23: não deve permitir que um PROFISSIONAL crie outro profissional', async () => {
      const response = await request(app)
        .post('/api/profissionais')
        .set('Authorization', `Bearer ${profissionalToken}`)
        .send({
          nome: 'Dr. Ilegal',
          cpf: '10101010101',
          crm: '10101SP',
          ufCrm: 'SP',
          especialidadePrincipal: 'Cardiologia',
          telefone: '11910101010',
          email: 'dr.ilegal@sghss.com',
          senha: 'senhaIlegal123',
        });
      expect(response.status).toBe(403);
    });

     it('CT24: deve retornar 409 ao tentar criar um profissional com email duplicado', async () => {
        const response = await request(app)
            .post('/api/profissionais')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                nome: "Outro Doutor",
                cpf: "88877766655",
                crm: "67890MG",
                ufCrm: "MG",
                especialidadePrincipal: "Neurologia",
                telefone: "31977665544",
                email: "dr.house@sghss.com", // Email existente
                senha: "novaSenha123"
            });
        expect(response.status).toBe(409);
        expect(response.body.error).toContain('email');
    });
  });

   describe('GET /api/profissionais/:id/disponibilidade', () => {
    beforeAll(async () => {
        await prisma.gradeHoraria.create({
            data: {
                profissionalId: profissionalId,
                diaDaSemana: new Date('2025-08-15T12:00:00.000Z').getUTCDay(), // Sexta-feira
                horaInicio: '09:00',
                horaFim: '12:00',
                duracaoConsultaMinutos: 30,
            },
        });
    });

    it('CT25: deve retornar horários disponíveis para um profissional em uma data válida', async () => {
        const response = await request(app)
            .get(`/api/profissionais/${profissionalId}/disponibilidade?data=2025-08-15`);
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body).toContain('2025-08-15T09:00:00.000Z');
    });

     it('CT28: deve retornar 400 se o parâmetro data não for fornecido', async () => {
        const response = await request(app)
            .get(`/api/profissionais/${profissionalId}/disponibilidade`);
        expect(response.status).toBe(400);
    });
   });
});