const express = require('express');
const router = express.Router();
const { upload } = require('../controllers/clubController');
const clubController = require('../controllers/clubController');
const reservasController = require('../controllers/reservasController'); // Importar el controlador de reservas

// Ruta para obtener todos los clubes
router.get('/', clubController.getAllClubs);

// Ruta para buscar clubes
router.get('/search', clubController.searchClubs);

// Ruta para crear un club
router.post('/create', clubController.createClub);

// Ruta para obtener el logo de un club
router.get('/:id_club/logo', clubController.getClubLogo);

// Ruta para subir el logo de un club
router.post('/uploadClubLogo/:id_club', upload.single('logo'), clubController.uploadClubLogo);

// Ruta para borrar un club
router.delete('/:id_club', clubController.deleteClub);

// Ruta para actualizar un club
router.put('/:id_club', clubController.updateClub);

// Ruta para actualizar solo el color de un club
router.put('/:id_club/color', clubController.updateClubColor);

// Ruta para obtener el club por ID de usuario (POST)
router.post('/user', clubController.getClubByUserId);

// Ruta para obtener un club por ID
router.get('/:id_club', clubController.getClubById);

// Ruta para actualizar la URL de Google Maps de un club
router.put('/:id_club/url_maps', clubController.updateClubUrlMaps);

module.exports = router;
