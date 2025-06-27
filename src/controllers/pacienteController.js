const pacienteService = require('../services/pacienteService');
const AppError = require('../utils/AppError');

const pacienteController = {
  listarTodos: async (req, res, next) => {
    try {
      const pacientes = await pacienteService.listarTodos();
      res.json({ pacientes });
    } catch (err) {
      next(err);
    }
  },

  buscarPorId: async (req, res, next) => {
    try {
      const { id } = req.params;
      const paciente = await pacienteService.buscarPorId(id);
      if (!paciente) throw new AppError(404, 'Paciente não encontrado');
      res.json(paciente);
    } catch (err) {
      next(err);
    }
  },

  criar: async (req, res, next) => {
    try {
      const dados = req.body;
      const novo = await pacienteService.criar(dados);
      res.status(201).json(novo);
    } catch (err) {
      // Prisma unique constraint violation (CPF)
      if (err.code === 'P2002' && err.meta.target.includes('cpf')) {
        return next(new AppError(409, 'CPF já cadastrado'));
      }
      next(err);
    }
  },

  atualizar: async (req, res, next) => {
    try {
      const { id } = req.params;
      const dados = req.body;
      const atualizado = await pacienteService.atualizar(id, dados);
      if (!atualizado) throw new AppError(404, 'Paciente não encontrado para atualização');
      res.json(atualizado);
    } catch (err) {
      next(err);
    }
  },

  deletar: async (req, res, next) => {
    try {
      const { id } = req.params;
      await pacienteService.deletar(id);
      res.status(204).send();
    } catch (err) {
      // Pode ser P2025 se o registro não existir
      if (err.code === 'P2025') {
        return next(new AppError(404, 'Paciente não encontrado para exclusão'));
      }
      next(err);
    }
  }
};

module.exports = pacienteController;
