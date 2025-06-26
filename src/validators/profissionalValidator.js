const { z } = require('zod');

const profissionalBase = {
  nome: z.string().min(3),
  cpf: z.string().length(11),
  especialidade: z.string().min(3),
  contato: z.string().min(8)
};

const criarProfissionalSchema = z.object(profissionalBase);
const atualizarProfissionalSchema = z.object({
  ...profissionalBase,
  nome: profissionalBase.nome.optional(),
  especialidade: profissionalBase.especialidade.optional(),
  contato: profissionalBase.contato.optional()
});

module.exports = {
  criarProfissionalSchema,
  atualizarProfissionalSchema
};
