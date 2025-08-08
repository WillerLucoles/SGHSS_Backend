// src/__tests__/pacientes.test.js

import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';
import { criarPaciente } from './utils/test-helpers';

const prisma = new PrismaClient();

describe('API de Pacientes', () => {

  beforeEach(async () => {
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

  it('deve ser capaz de registar um novo paciente com dados válidos', async () => {
    const novoPaciente = {
      nome: "Paciente de Teste Válido",
      cpf: "11122233344",
      dataNascimento: "1990-01-01T00:00:00.000Z",
      genero: "OUTRO",
      telefonePrincipal: "31999888777",
      logradouro: "Rua do Teste",
      numero: "123",
      bairro: "Centro",
      cidade: "Cidade Teste",
      estado: "MG",
      cep: "30130000",
      email: "paciente.valido@email.com",
      senha: "senhaSegura123"
    };

    const response = await request(app)
      .post('/api/pacientes/register')
      .send(novoPaciente);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.nome).toBe(novoPaciente.nome);
  });

  it('deve retornar um erro 409 ao tentar registar um paciente com um email que já existe', async () => {
    await criarPaciente({
        email: 'paciente.duplicado@email.com',
        senha: 'senhaValida123',
        cpf: '00011122233'
    });
    
    const pacienteComEmailDuplicado = {
      nome: "Outro Paciente",
      cpf: "22233344455",
      dataNascimento: "1995-05-05T00:00:00.000Z",
      genero: "MASCULINO",
      telefonePrincipal: "31988776655",
      logradouro: "Avenida do Teste",
      numero: "456",
      bairro: "Teste",
      cidade: "Cidade Teste",
      estado: "MG",
      cep: "30140000",
      email: "paciente.duplicado@email.com",
      senha: "outraSenhaSegura"
    };

    const response = await request(app)
      .post('/api/pacientes/register')
      .send(pacienteComEmailDuplicado);

    expect(response.status).toBe(409);
    expect(response.body.error).toBe('Este email já está em uso.');
  });
});