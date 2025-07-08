// src/validators/profissionalValidator.js
import { z } from 'zod';


export const criarProfissionalSchema = z.object({
  nome: z.string().min(3),
  cpf: z.string().length(11),
  crm: z.string().min(1, { message: 'O CRM é obrigatório.' }),
  ufCrm: z.string().length(2, { message: 'A UF do CRM deve ter 2 caracteres.' }),
  especialidadePrincipal: z.string().min(3),
  especialidadesSecundarias: z.array(z.string()).optional(),
  telefone: z.string().min(10),
  email: z.string().email({ message: 'Formato de email inválido.' }),
  senha: z.string().min(8, { message: 'A senha deve ter no mínimo 8 caracteres.' })
});


export const atualizarProfissionalSchema = z.object({
    nome: z.string().min(3).optional(),
    especialidadePrincipal: z.string().min(3).optional(),
    especialidadesSecundarias: z.array(z.string()).optional(),
    telefone: z.string().min(10).optional(),
});