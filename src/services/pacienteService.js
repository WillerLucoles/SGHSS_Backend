// src/services/pacienteService.js

import prisma from '../config/prismaClient.js';
import AppError from '../utils/AppError.js';
import bcrypt from 'bcryptjs';



const registrarNovoPaciente = async (dadosPaciente) => {
  const { nome, cpf, dataNascimento, email, senha, ...outrosDados } = dadosPaciente;

  // 1. Verificar se o email ou CPF já existem para evitar duplicatas
  const usuarioExistente = await prisma.usuario.findUnique({ where: { email } });
  if (usuarioExistente) {
    throw new AppError('Este email já está em uso.', 409); // 409 Conflict
  }

  const pacienteExistente = await prisma.paciente.findUnique({ where: { cpf } });
  if (pacienteExistente) {
    throw new AppError('Este CPF já está cadastrado.', 409);
  }

  // 2. Criptografar a senha antes de salvar no banco
  const senhaHash = await bcrypt.hash(senha, 8);

  // 3. Usar uma transação para garantir que ambos os registros (Usuario e Paciente) sejam criados
  const novoPaciente = await prisma.$transaction(async (tx) => {    
    const novoUsuario = await tx.usuario.create({
      data: {
        email,
        senha: senhaHash,
        role: 'PACIENTE',
      },
    });

    // Cria a ficha completa do paciente, vinculando ao usuário
    const pacienteCriado = await tx.paciente.create({
      data: {
        nome,
        cpf,
        dataNascimento: new Date(dataNascimento),
        ...outrosDados,
        usuarioId: novoUsuario.id, // Vínculo com a entidade de autenticação
      },
    });

    return pacienteCriado;
  });

  return novoPaciente;
};


export default {  
  registrarNovoPaciente,
};