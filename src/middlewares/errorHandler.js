// src/middlewares/errorHandler.js


import { ZodError } from 'zod';
import logger from '../utils/logger.js';
import AppError from '../utils/AppError.js';

// --- FUNÇÃO DO MIDDLEWARE ---

export default function errorHandler(err, req, res, next) {

  if (err.name === 'ZodError') {
    const errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      msg: e.message,
    }));
    logger.warn('Falha na validação (Zod): %o', errors);
    return res.status(400).json({ errors });
  }

  if (err instanceof AppError) {
    logger.warn(`AppError: ${err.statusCode} - ${err.message}`);
    return res.status(err.statusCode).json({ error: err.message });
  }


  logger.error('Erro inesperado: %o', err);
  res.status(500).json({ error: 'Algo inesperado aconteceu no servidor.' });
}