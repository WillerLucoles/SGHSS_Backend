// src/__tests__/pacientes.test.js

import request from 'supertest';
import app from '../app'; // A nossa aplicação Express
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Descrevemos o nosso conjunto de testes para a API de Pacientes
describe('API de Pacientes', () => {

  // Antes de todos os testes deste conjunto, garantimos que a base de dados de teste está limpa.
  beforeAll(async () => {
    // Apagamos na ordem inversa das dependências para evitar erros de chave estrangeira
    await prisma.anexoClinico.deleteMany({});
    await prisma.registroClinico.deleteMany({});
    await prisma.consultas.deleteMany({});
    await prisma.paciente.deleteMany({});
    await prisma.usuario.deleteMany({ where: { role: 'PACIENTE' } });
  });

  // Depois de todos os testes, fechamos a conexão com a base de dados.
  afterAll(async () => {
    await prisma.$disconnect();
  });


  // --- TESTES PARA O REGISTO DE PACIENTES (POST /api/pacientes/register) ---

  // Teste 1: O "Caminho Feliz"
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
  }, 10000);

  // Teste 2: Erro de Conflito (Email Duplicado)
  it('deve retornar um erro 409 ao tentar registar um paciente com um email que já existe', async () => {
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
      email: "paciente.valido@email.com", // Mesmo email do paciente anterior
      senha: "outraSenhaSegura"
    };

    const response = await request(app)
      .post('/api/pacientes/register')
      .send(pacienteComEmailDuplicado);

    expect(response.status).toBe(409); // Esperamos um erro de Conflito
    expect(response.body.error).toBe('Este email já está em uso.');
  });

  // Teste 3: Erro de Validação (Dados Inválidos)
  it('deve retornar um erro 400 ao tentar registar um paciente com dados inválidos (ex: CPF curto)', async () => {
    const pacienteComDadosInvalidos = {
      nome: "Paciente Inválido",
      cpf: "123", // CPF inválido
      dataNascimento: "1990-01-01T00:00:00.000Z",
      genero: "FEMININO",
      telefonePrincipal: "31911223344",
      logradouro: "Rua Inválida",
      numero: "s/n",
      bairro: "Bairro Inválido",
      cidade: "Cidade Inválida",
      estado: "TS",
      cep: "12345678",
      email: "paciente.invalido@email.com",
      senha: "senha123"
    };

    const response = await request(app)
      .post('/api/pacientes/register')
      .send(pacienteComDadosInvalidos);
    
    expect(response.status).toBe(400); // Esperamos um erro de Bad Request
    expect(response.body.errors[0].field).toBe('cpf'); // Verificamos se o erro foi no campo CPF
  });


  // --- TESTES PARA ROTAS PROTEGIDAS (/me) ---

  describe('Rotas de Perfil do Paciente (/me)', () => {
    let token; // Guardar o token do nosso paciente aqui
    let pacienteId;

    // Antes dos testes deste bloco, criamos e logamos com um paciente para ter um token válido
    beforeAll(async () => {
      const pacienteParaLogin = {
        nome: "Paciente Para Login",
        cpf: "55566677788",
        dataNascimento: "2000-02-02T00:00:00.000Z",
        genero: "FEMININO",
        telefonePrincipal: "31955667788",
        logradouro: "Rua do Login",
        numero: "789",
        bairro: "Autenticado",
        cidade: "Cidade Segura",
        estado: "MG",
        cep: "30150000",
        email: "paciente.login@email.com",
        senha: "senhaSuperSegura"
      };
      
      const resRegistro = await request(app).post('/api/pacientes/register').send(pacienteParaLogin);
      pacienteId = resRegistro.body.id;

      const resLogin = await request(app).post('/api/usuarios/login').send({
        email: pacienteParaLogin.email,
        senha: pacienteParaLogin.senha,
      });
      token = resLogin.body.token;
    });

    // Teste 4: Tentativa de Acesso sem Token
    it('deve retornar um erro 401 ao tentar aceder a /me sem um token', async () => {
      const response = await request(app).get('/api/pacientes/me');
      expect(response.status).toBe(401);
    });

    // Teste 5: Acesso bem-sucedido com Token
    it('deve retornar os dados do perfil ao aceder a /me com um token válido', async () => {
      const response = await request(app)
        .get('/api/pacientes/me')
        .set('Authorization', `Bearer ${token}`); // Enviamos o token no cabeçalho

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', pacienteId);
      expect(response.body.email).toBeUndefined(); // Garante que a senha não está a ser exposta
    });
  });

});