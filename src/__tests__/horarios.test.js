// src/__tests__/horarios.test.js

import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';
import { criarProfissional } from './utils/test-helpers';

const prisma = new PrismaClient();

describe('API de Horários', () => {
  let profissionalToken;

  beforeAll(async () => {
    // Limpar as tabelas relevantes antes de começar
    await prisma.$transaction([
      prisma.anexoClinico.deleteMany({}),
      prisma.registroClinico.deleteMany({}),
      prisma.consultas.deleteMany({}),
      prisma.indisponibilidade.deleteMany({}),
      prisma.gradeHoraria.deleteMany({}),
      prisma.paciente.deleteMany({}),
      prisma.profissional.deleteMany({}),
      prisma.usuario.deleteMany({}),
    ]);

    // **INÍCIO DA CORREÇÃO: Criar um profissional e obter o token**
    const profissional = await criarProfissional({
      email: 'dr.agenda@sghss.com',
      senha: 'senhaAgendaValida123',
      cpf: '33344455566',
      crm: '67890SP',
    });
    profissionalToken = profissional.token;
    // **FIM DA CORREÇÃO**
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/horarios/grade-semanal', () => {
    it('CT29: deve permitir que um profissional defina sua grade horária', async () => {
      const novaGrade = [
        {
          diaDaSemana: 1, // Segunda-feira
          horaInicio: '08:00',
          horaFim: '17:00',
          duracaoConsultaMinutos: 30,
        },
        {
          diaDaSemana: 3, // Quarta-feira
          horaInicio: '09:00',
          horaFim: '13:00',
          duracaoConsultaMinutos: 60,
        },
      ];

      const response = await request(app)
        .post('/api/horarios/grade-semanal')
        .set('Authorization', `Bearer ${profissionalToken}`)
        .send(novaGrade);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe(
        'Grade horária semanal definida com sucesso.'
      );

      // Verificação opcional no banco de dados
      const gradesSalvas = await prisma.gradeHoraria.findMany();
      expect(gradesSalvas.length).toBe(2);
      expect(gradesSalvas[0].horaInicio).toBe('08:00');
    });
  });
});