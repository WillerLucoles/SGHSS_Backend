// src/server.js
import app from './app.js';
import logger from './utils/logger.js';

// --- INICIALIZAÇÃO DO SERVIDOR ---

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.info(`Servidor rodando na porta ${PORT}`));