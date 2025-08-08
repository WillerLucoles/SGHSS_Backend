// src/__tests__/setup.js

import dotenv from 'dotenv';
import path from 'path';

// Este console.log é útil para confirmar que o Jest está a executar este ficheiro
console.log('A carregar o ambiente de teste a partir de .env.test...');

// Carrega as variáveis de ambiente do ficheiro .env.test
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });