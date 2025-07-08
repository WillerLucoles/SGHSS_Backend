//src/validators/pacienteValidator.js

import { z } from 'zod';


export const registrarPacienteSchema = z.object({
  // O 'body' da requisição deve conter estes campos...
  nome: z.string({ required_error: 'O nome é obrigatório.' }).min(3, { message: 'O nome deve ter no mínimo 3 caracteres.' }),
  cpf: z.string({ required_error: 'O CPF é obrigatório.' }).length(11, { message: 'O CPF deve ter exatamente 11 caracteres.' }),
  dataNascimento: z.string({ required_error: 'A data de nascimento é obrigatória.' }).datetime({ message: 'A data deve estar no formato ISO 8601 (ex: "2000-12-31T00:00:00.000Z")' }),
  genero: z.enum(['MASCULINO', 'FEMININO', 'OUTRO'], { errorMap: () => ({ message: "O gênero deve ser 'MASCULINO', 'FEMININO' ou 'OUTRO'." }) }),
  telefonePrincipal: z.string({ required_error: 'O telefone é obrigatório.' }).min(10, { message: 'O telefone deve ter no mínimo 10 caracteres.' }),
  
  // Dados de endereço
  logradouro: z.string({ required_error: 'O logradouro é obrigatório.' }),
  numero: z.string({ required_error: 'O número é obrigatório.' }),
  bairro: z.string({ required_error: 'O bairro é obrigatório.' }),
  cidade: z.string({ required_error: 'A cidade é obrigatória.' }),
  estado: z.string({ required_error: 'O estado é obrigatório.' }).length(2, { message: 'O estado deve ter 2 caracteres (ex: "SP").' }),
  cep: z.string({ required_error: 'O CEP é obrigatório.' }).length(8, { message: 'O CEP deve ter 8 caracteres (apenas números).' }),

  // Dados de login
  email: z.string({ required_error: 'O email é obrigatório.' }).email({ message: 'Formato de email inválido.' }),
  senha: z.string({ required_error: 'A senha é obrigatória.' }).min(8, { message: 'A senha deve ter no mínimo 8 caracteres.' }),
  
  // Campos opcionais podem ser definidos com .optional()
  complemento: z.string().optional(),
  telefoneSecundario: z.string().optional(),
});

export const atualizarMeuPerfilSchema = z.object({
  // A maioria dos campos é opcional na atualização, pois o utilizador 
  nome: z.string().min(3, { message: 'O nome deve ter no mínimo 3 caracteres.' }).optional(),
  dataNascimento: z.string().datetime({ message: 'A data deve estar no formato ISO 8601.' }).optional(),
  genero: z.enum(['MASCULINO', 'FEMININO', 'OUTRO']).optional(),
  telefonePrincipal: z.string().min(10, { message: 'O telefone deve ter no mínimo 10 caracteres.' }).optional(),
  
  // Endereço
  logradouro: z.string().optional(),
  numero: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().length(2, { message: 'O estado deve ter 2 caracteres.' }).optional(),
  cep: z.string().length(8, { message: 'O CEP deve ter 8 caracteres.' }).optional(),
  // Campos que não devem ser alterados pelo utilizador não são incluídos aqui,

});