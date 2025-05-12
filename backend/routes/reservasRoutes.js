const express = require('express');
const router = express.Router();
const reservasController = require('../controllers/reservasController');

// Ruta para obtener las reservas de un usuario (próximas o anteriores)
router.get('/usuario/:id_usuario', reservasController.getReservasUsuario);

// Crear una reserva
router.post('/create', reservasController.crearReserva);

// Obtener reservas por fecha y club
router.get('/:fecha', reservasController.getReservasByDate);

// Cancelar una reserva
router.delete('/cancelar/:id_reserva', reservasController.cancelarReserva);

module.exports = router;