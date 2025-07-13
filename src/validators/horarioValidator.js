// src/validators/horarioValidator.js
import { z } from 'zod';

const gradeHorariaSchema = z.object({
  diaDaSemana: z.number({ required_error: 'O dia da semana é obrigatório.' }).min(0).max(6),
  horaInicio: z.string({ required_error: 'A hora de início é obrigatória.' }).regex(/^\d{2}:\d{2}$/, 'Formato HH:MM.'),
  horaFim: z.string({ required_error: 'A hora de fim é obrigatória.' }).regex(/^\d{2}:\d{2}$/, 'Formato HH:MM.'),
  duracaoConsultaMinutos: z.number().int().positive().optional().default(30),
});

export const criarGradeSemanalSchema = z.array(gradeHorariaSchema);