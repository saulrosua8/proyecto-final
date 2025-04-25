const express = require('express');
const router = express.Router();
const clubController = require('../controllers/clubController');

// Ruta para obtener todos los clubes
router.get('/', clubController.getAllClubs);

// Ruta para buscar clubes
router.get('/search', clubController.searchClubs);

module.exports = router;
