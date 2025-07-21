// src/validators/quartoValidator.js
import { z } from 'zod';

const CategoriaQuartoEnum = z.enum([
  'MASCULINO',
  'FEMININO',
  'PEDIATRICO',
  'ISOLAMENTO',
  'UTI_GERAL'
]);

// Schema para criar um novo quarto
export const criarQuartoSchema = z.object({
  numeroQuarto: z.string().min(1, "O número do quarto é obrigatório."),
  categoria: z
    .string()
    .transform(val => val.toUpperCase())
    .pipe(CategoriaQuartoEnum),

  capacidade: z.number().int().positive("A capacidade deve ser um número inteiro positivo."),
});

export const atualizarQuartoSchema = criarQuartoSchema.partial();