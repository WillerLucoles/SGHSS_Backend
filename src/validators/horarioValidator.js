// src/validators/horarioValidator.js
import { z } from 'zod';

const gradeHorariaSchema = z.object({
  diaDaSemana: z.number({ required_error: 'O dia da semana é obrigatório.' }).min(0).max(6),
  horaInicio: z.string({ required_error: 'A hora de início é obrigatória.' }).regex(/^\d{2}:\d{2}$/, 'Formato HH:MM.'),
  horaFim: z.string({ required_error: 'A hora de fim é obrigatória.' }).regex(/^\d{2}:\d{2}$/, 'Formato HH:MM.'),
  duracaoConsultaMinutos: z.number().int().positive().optional().default(30),
});

export const criarGradeSemanalSchema = z.array(gradeHorariaSchema);


const indisponibilidadeSchema = z.object({
  inicio: z.string().datetime({ message: 'A data de início deve estar no formato ISO 8601.' }),
  fim: z.string().datetime({ message: 'A data de fim deve estar no formato ISO 8601.' }),
  motivo: z.string().min(3).optional(),
}).refine(data => new Date(data.fim) > new Date(data.inicio), {
  message: 'A data de fim deve ser posterior à data de início.',
  path: ['fim'],
});

export const criarIndisponibilidadesSchema = z.array(indisponibilidadeSchema);