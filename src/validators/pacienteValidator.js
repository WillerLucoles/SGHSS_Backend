const { z } = require('zod');

const pacienteBase = {
  nome: z.string().min(3),
  cpf: z.string().length(11),
  dataNascimento: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Data inválida'
  }),
  endereco: z.string().min(5),
  contato: z.string().min(8),
  historicoClinico: z.string().optional()
};

const criarPacienteSchema = z.object(pacienteBase);
const atualizarPacienteSchema = z.object({
  ...pacienteBase,
  nome: pacienteBase.nome.optional(),
});

module.exports = {
  criarPacienteSchema,
  atualizarPacienteSchema
};
