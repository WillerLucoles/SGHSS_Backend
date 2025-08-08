// src/__tests__/consultas.test.js

import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';
import { criarProfissional, criarPaciente } from './utils/test-helpers';

const prisma = new PrismaClient();

describe('API de Consultas', () => {
  let pacienteToken;
  let profissionalToken;
  let pacienteId;
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

  describe('Agendamento de Consulta', () => {
    let consultaId;

    it('CT37: um paciente deve conseguir agendar uma consulta em um horário livre', async () => {
      const response = await request(app)
        .post('/api/consultas')
        .set('Authorization', `Bearer ${pacienteToken}`)
        .send({
          profissionalId,
          dataHoraInicio: '2025-10-20T14:00:00.000Z',
        });
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      consultaId = response.body.id;
    });

    it('CT38: deve retornar 409 ao tentar agendar um horário já ocupado', async () => {
       const response = await request(app)
        .post('/api/consultas')
        .set('Authorization', `Bearer ${pacienteToken}`)
        .send({
          profissionalId,
          dataHoraInicio: '2025-10-20T14:00:00.000Z',
        });
      expect(response.status).toBe(409);
    });

    it('CT43: o profissional deve conseguir criar um registro clínico para a consulta', async () => {
        const response = await request(app)
            .put(`/api/consultas/${consultaId}/registro-clinico`)
            .set('Authorization', `Bearer ${profissionalToken}`)
            .send({
                queixa: "Dor de cabeça persistente.",
                conduta: "Analgésicos e observação."
            });
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id');
        expect(response.body.queixa).toBe("Dor de cabeça persistente.");
    });

     it('CT44: o status da consulta deve mudar para REALIZADA após salvar o registro', async () => {
        const consulta = await prisma.consultas.findUnique({ where: { id: consultaId }});
        expect(consulta.statusConsulta).toBe('REALIZADA');
    });
  });
});