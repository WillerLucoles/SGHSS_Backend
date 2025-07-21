// src/validators/internacaoValidator.js
import { z } from 'zod';

export const criarInternacaoSchema = z.object({
  pacienteId: z.string().uuid("O ID do paciente é obrigatório."),
  leitoId: z.string().uuid("O ID do leito é obrigatório."),
  dataEntrada: z.string().datetime({ message: 'A data de entrada deve estar no formato ISO 8601.' }),
  dataPrevistaAlta: z.string().datetime({ message: 'A data prevista de alta deve estar no formato ISO 8601.' }).optional(),
  profissionalId: z.string().uuid("O ID do profissional responsável é obrigatório."),
});