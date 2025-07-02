// src/validators/consultaValidator.js


import { z } from 'zod';


export const criarConsultaSchema = z.object({
  dataConsulta: z
    .string()
    .refine((v) => !isNaN(Date.parse(v)), { message: 'Data inválida' }),
  horario: z.string().regex(/^\d{2}:\d{2}$/, { message: 'Formato HH:MM' }),
  status: z.enum(['agendada', 'cancelada', 'concluída']),
  pacienteId: z.number().int().positive(),
  profissionalId: z.number().int().positive(),
});

export const atualizarConsultaSchema = criarConsultaSchema.partial();