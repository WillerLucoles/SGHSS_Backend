// src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const prisma = require('./config/prismaClient');

const app = express();

app.use(cors());
app.use(express.json());

// Rota de Teste: Cria um Paciente
app.post('/api/pacientes', async (req, res) => {
  const { nome, cpf, dataNascimento, endereco, contato, historicoClinico } = req.body;
  
  try {
    const paciente = await prisma.paciente.create({
      data: {
        nome,
        cpf,
        dataNascimento: new Date(dataNascimento),
        endereco,
        contato,
        historicoClinico,
      },
    });
    res.status(201).json({ paciente });
  } catch (error) {
    console.error("Erro ao criar paciente:", error);
    res.status(500).json({ error: 'Erro ao criar paciente' });
  }
});

// Rota de Teste: Lista todos os Pacientes
app.get('/api/pacientes', async (req, res) => {
  try {
    const pacientes = await prisma.paciente.findMany();
    res.json({ pacientes });
  } catch (error) {
    console.error("Erro ao buscar pacientes:", error);
    res.status(500).json({ error: 'Erro ao buscar pacientes' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
