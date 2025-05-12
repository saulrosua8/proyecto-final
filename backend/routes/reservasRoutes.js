const express = require('express');
const router = express.Router();
const reservasController = require('../controllers/reservasController');

// Crear una reserva
router.post('/create', reservasController.crearReserva);

// Obtener reservas por fecha y club
router.get('/:fecha', reservasController.getReservasByDate);

module.exports = router;