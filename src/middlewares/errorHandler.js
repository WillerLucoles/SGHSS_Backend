// src/middlewares/errorHandler.js
const { ZodError } = require('zod');
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

function errorHandler(err, req, res, next) {
  // 1) Erros de validação do Zod
  if (err instanceof ZodError) {
    const errors = err.errors.map(e => ({
      field: e.path.join('.'),
      msg: e.message
    }));
    logger.warn('Zod validation failed: %o', errors);
    return res.status(400).json({ errors });
  }

  // 2) Erros criados via AppError
  if (err instanceof AppError) {
    logger.warn('AppError: %d %s', err.status, err.message);
    return res.status(err.status).json({ error: err.message });
  }

  
  logger.error('Unexpected error: %o', err);
  res.status(500).json({ error: 'Algo inesperado aconteceu' });
}

module.exports = errorHandler;
