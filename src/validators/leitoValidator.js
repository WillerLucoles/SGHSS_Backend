// src/validators/leitoValidator.js
import { z } from 'zod';

const StatusLeitoEnum = z.enum([
  'LIVRE',
  'OCUPADO',
  'MANUTENCAO',
  'HIGIENIZACAO'
]);

// Schema para criar um novo leito
export const criarLeitoSchema = z.object({
  identificacaoLeito: z.string().min(1, "A identificação do leito é obrigatória."),
  quartoId: z.string().uuid("O ID do quarto deve ser um UUID válido."),
  status: StatusLeitoEnum.optional().default('LIVRE'),
});

// Schema para atualizar um leito (só o status pode ser mudado por um admin)
export const atualizarLeitoSchema = z.object({
    status: StatusLeitoEnum,
});