// src/validators/consultaValidator.js
import { z } from 'zod';

export const agendarConsultaSchema = z.object({
  profissionalId: z.string().uuid({ message: 'O ID do profissional deve ser um UUID válido.' }),
  dataHoraInicio: z.string().datetime({ message: 'A data e hora de início devem estar no formato ISO 8601.' }),
});