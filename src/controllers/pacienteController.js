// src/controllers/pacienteController.js

import pacienteService from '../services/pacienteService.js';



const registrar = async (req, res, next) => {
  try {
    // Os dados vêm do corpo da requisição
    const novoPaciente = await pacienteService.registrarNovoPaciente(req.body);
    
    // Retorna o status 201 (Created) e os dados do paciente criado
    res.status(201).json(novoPaciente);
  } catch (error) {
    next(error); // Passa o erro para o nosso middleware de tratamento de erros
  }
};


export default { 
  registrar,
};