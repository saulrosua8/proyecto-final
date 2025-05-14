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

// Estadísticas para admin
router.get('/mas-reservadas/:id_club', reservasController.getPistasMasReservadas);
router.get('/horas-mas-reservadas/:id_club', reservasController.getHorasMasReservadas);
router.get('/clientes-mas-reservas/:id_club', reservasController.getClientesMasReservas);
router.get('/ganancias/:id_club', reservasController.getGananciasPorMes);

module.exports = router;