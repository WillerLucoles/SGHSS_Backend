// src/controllers/pacienteController.js

import pacienteService from '../services/pacienteService.js';
import AppError from '../utils/AppError.js';

const pacienteController = {
  registrar: async (req, res, next) => {
    try {
      const novoPaciente = await pacienteService.registrarNovoPaciente(req.body);
      res.status(201).json(novoPaciente);
    } catch (error) {
      next(error);
    }
  },

  listarTodos: async (req, res, next) => {
    try {
      const pacientes = await pacienteService.listarTodos();
      res.json(pacientes);
    } catch (err) {
      next(err);
    }
  },

  buscarPorId: async (req, res, next) => {
    try {
      const paciente = await pacienteService.buscarPorId(req.params.id);
      if (!paciente) {
        throw new AppError(404, 'Paciente não encontrado');
      }
      res.json(paciente);
    } catch (err) {
      next(err);
    }
  },

  atualizar: async (req, res, next) => {
    try {
      const atualizado = await pacienteService.atualizar(req.params.id, req.body);
      res.json(atualizado);
    } catch (err) {
      // Código P2025 significa que o registo a ser atualizado não foi encontrado
      if (err.code === 'P2025') {
        return next(new AppError(404, 'Paciente não encontrado para atualização'));
      }
      next(err);
    }
  },

  deletar: async (req, res, next) => {
    try {
      await pacienteService.deletar(req.params.id);
      res.status(204).send(); // 204 No Content é a resposta padrão para um delete bem-sucedido
    } catch (err) {
      next(err);
    }
  },

  buscarMeuPerfil: async (req, res, next) => {
    try {
      // O ID do utilizador logado é injetado pelo nosso authMiddleware
      const usuarioId = req.usuario.id;
      
      const paciente = await pacienteService.buscarPorUsuarioId(usuarioId);
      
      if (!paciente) {
        throw new AppError(404, 'Perfil de paciente não encontrado para este utilizador.');
      }
      
      res.json(paciente);
    } catch (err) {
      next(err);
    }
  },

  atualizarMeuPerfil: async (req, res, next) => {
    try {
      const usuarioId = req.usuario.id;
      const dadosParaAtualizar = req.body;

      const pacienteAtualizado = await pacienteService.atualizarMeuPerfil(
        usuarioId,
        dadosParaAtualizar
      );
      
      res.json(pacienteAtualizado);
    } catch (err) {
      next(err);
    }
  },
  
};

export default pacienteController;