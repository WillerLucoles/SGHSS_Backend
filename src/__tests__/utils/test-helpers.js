// src/__tests__/utils/test-helpers.js

import request from 'supertest';
import app from '../../app.js'; 

/**
 * Faz login com o utilizador administrador definido no .env.test e retorna o token.
 */
export async function criarAdmin() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminSenha = process.env.SEED_ADMIN_SENHA;

  if (!adminEmail || !adminSenha) {
    throw new Error('As variáveis SEED_ADMIN_EMAIL e SEED_ADMIN_SENHA devem estar definidas no seu .env.test');
  }

  const res = await request(app).post('/api/usuarios/login').send({
    email: adminEmail,
    senha: adminSenha,
  });

  if (res.status !== 200) {
    console.error('Falha ao fazer login como admin no setup do teste:', res.body);
    throw new Error('Não foi possível obter o token de admin para os testes. Verifique se o seed do admin foi executado no banco de teste.');
  }

  return { token: res.body.token };
}

/**
 * Usa um token de admin para criar um novo profissional e depois faz login para retornar o token do profissional.
 */
export async function criarProfissional(dados) {
  const admin = await criarAdmin();
  
  const dadosProfissional = {
      nome: dados.nome || 'Dr. House Teste',
      cpf: dados.cpf || '11122233344',
      crm: dados.crm || '12345MG',
      ufCrm: 'MG',
      especialidadePrincipal: 'Nefrologia',
      telefone: '31912345678',
      email: dados.email,
      senha: dados.senha,
  };
  
  const resCriacao = await request(app)
    .post('/api/profissionais')
    .set('Authorization', `Bearer ${admin.token}`)
    .send(dadosProfissional);
  
  if (resCriacao.status !== 201) {
    console.error('Falha ao criar profissional no setup do teste:', resCriacao.body);
  }

  const resLogin = await request(app).post('/api/usuarios/login').send({ email: dados.email, senha: dados.senha });

  return { ...resCriacao.body, token: resLogin.body.token };
}

/**
 * Regista um novo paciente e faz login para retornar o token e os dados do paciente.
 */
export async function criarPaciente(dados) {
   const dadosPaciente = {
        nome: dados.nome || "Paciente de Teste",
        cpf: dados.cpf || '22233344455',
        dataNascimento: dados.dataNascimento || "1990-01-01T00:00:00.000Z",
        genero: dados.genero || "OUTRO",
        telefonePrincipal: "31999888777",
        logradouro: "Rua do Teste",
        numero: "123",
        bairro: "Centro",
        cidade: "Cidade Teste",
        estado: "MG",
        cep: "30130000",
        email: dados.email,
        senha: dados.senha,
    };

   const resCriacao = await request(app)
    .post('/api/pacientes/register')
    .send(dadosPaciente);
    
    if (resCriacao.status !== 201) {
        console.error('Falha ao criar paciente no setup do teste:', resCriacao.body);
    }

    const resLogin = await request(app).post('/api/usuarios/login').send({ email: dados.email, senha: dados.senha });

    return { ...resCriacao.body, token: resLogin.body.token };
}