const express = require('express');
const router = express.Router();
const stackHorarioController = require('../controllers/stackHorarioController');

router.get('/:id_club/:fecha', stackHorarioController.getHorariosByClubAndFecha);

// Ruta para alternar la disponibilidad de un horario
router.patch('/toggle/:id_horario', stackHorarioController.toggleDisponibilidad);

module.exports = router;
