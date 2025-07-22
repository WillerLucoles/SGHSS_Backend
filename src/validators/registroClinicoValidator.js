// src/validators/registroClinicoValidator.js
import { z } from 'zod';

// Schema para os anexos simulados
const anexoSchema = z.object({
  nomeArquivo: z.string().min(5, "O nome do arquivo é muito curto."),
  tipoDocumento: z.string().min(3, "O tipo de documento é muito curto."),
});

// Schema principal para criar ou atualizar um registro clínico
export const salvarRegistroSchema = z.object({
  qqueixa: z.string().optional(),
  exameFisico: z.string().optional(),
  hipotesesDiagnosticas: z.string().optional(),
  conduta: z.string().optional(),
  observacoesAdicionais: z.string().optional(),
  // O corpo da requisição pode ter um array de anexos
  anexos: z.array(anexoSchema).optional(),
});