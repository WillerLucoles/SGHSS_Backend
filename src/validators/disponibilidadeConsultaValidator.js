const { z } = require('zod');

const criarDisponibilidadeConsultaSchema = z.object({
  profissionalId: z.number().int().positive(),
  diaSemana: z.number().int().min(0).max(6),
  inicio: z.string().regex(/^\d{2}:\d{2}$/, { message: 'Formato HH:MM' }),
  fim: z.string().regex(/^\d{2}:\d{2}$/, { message: 'Formato HH:MM' })
});

module.exports = { criarDisponibilidadeConsultaSchema };
