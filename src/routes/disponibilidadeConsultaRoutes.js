const express = require('express');
const validate = require('../middlewares/validate');
const { criarDisponibilidadeConsultaSchema } = require('../validators/disponibilidadeConsultaValidator');
const disponibilidadeConsultaController = require('../controllers/disponibilidadeConsultaController');

const router = express.Router();

router.post('/', validate(criarDisponibilidadeConsultaSchema), disponibilidadeConsultaController.criar);
router.get('/:profissionalId', disponibilidadeConsultaController.listarPorProfissional);

module.exports = router;