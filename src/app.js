// src/app.js

import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import logger from './utils/logger.js';
import routes from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js';
import AppError from './utils/AppError.js';

// --- CONFIGURAÇÃO INICIAL ---
dotenv.config();

const app = express();

// --- MIDDLEWARES ---

// 1. HTTP request logging
app.use(morgan('dev'));

// 2. Body parsing e CORS
app.use(cors());
app.use(express.json());

// 3. Suas rotas
app.use('/api', routes);

// 4. Captura de rotas não encontradas (404)
app.use((req, res, next) => {
  next(new AppError(404, 'Recurso não encontrado'));
});

// 5. Middleware de erros centralizado
app.use(errorHandler);


// --- INICIALIZAÇÃO DO SERVIDOR ---

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => logger.info(`Servidor rodando na porta ${PORT}`));