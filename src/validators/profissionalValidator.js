// src/validators/profissionalValidator.js

import { z } from 'zod';


export const criarProfissionalSchema = z.object({
  nome: z.string().min(3),
  cpf: z.string().length(11),
  especialidade: z.string().min(3),
  contato: z.string().min(8),
});

export const atualizarProfissionalSchema = criarProfissionalSchema.partial();