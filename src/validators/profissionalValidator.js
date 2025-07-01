// src/validators/profissionalValidator.js
const { z } = require('zod');

const criarProfissionalSchema = z.object({
  nome: z.string().min(3),
  cpf: z.string().length(11),
  especialidade: z.string().min(3),
  contato: z.string().min(8)
});
const atualizarProfissionalSchema = criarProfissionalSchema.partial();

module.exports = {
  criarProfissionalSchema,
  atualizarProfissionalSchema
};
