const express = require('express');
const router = express.Router();
const clubController = require('../controllers/clubController');

// Ruta para obtener todos los clubes
router.get('/', clubController.getAllClubs);

// Ruta para buscar clubes
router.get('/search', clubController.searchClubs);

// Ruta para crear un club
router.post('/create', clubController.createClub);

// Ruta para borrar un club
router.delete('/:id_club', clubController.deleteClub);

// Ruta para actualizar un club
router.put('/:id_club', clubController.updateClub);

module.exports = router;
