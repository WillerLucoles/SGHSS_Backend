// src/validators/horarioValidator.js
import { z } from 'zod';

export const criarHorarioPadraoSchema = z.object({
  diaDaSemana: z.number({ required_error: 'O dia da semana é obrigatório.' }).min(0, 'O dia deve ser entre 0 (Domingo) e 6 (Sábado).').max(6, 'O dia deve ser entre 0 (Domingo) e 6 (Sábado).'),
  horaInicio: z.string({ required_error: 'A hora de início é obrigatória.' }).regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido. Use HH:MM.'),
  horaFim: z.string({ required_error: 'A hora de fim é obrigatória.' }).regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido. Use HH:MM.'),
  duracaoConsultaMinutos: z.number({ invalid_type_error: 'A duração deve ser um número.' }).int().positive().optional().default(30),
});