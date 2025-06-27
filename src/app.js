// src/app.js
// In production, we recommend using `prisma generate --no-engine` (See: `prisma generate --help`)

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const logger = require('./utils/logger');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// 1. HTTP request logging
app.use(morgan('dev'));

// 2. Body parsing e CORS
app.use(cors());
app.use(express.json());

// 3. Suas rotas
app.use('/api', routes);

// 4. Captura 404 (opcional)
app.use((req, res, next) => {
  next(new (require('./utils/AppError'))(404, 'Recurso não encontrado'));
});

// 5. Middleware de erros centralizado
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => logger.info('Servidor rodando na porta %d', PORT));
