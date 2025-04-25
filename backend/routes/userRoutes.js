const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Importamos el controlador que crearemos después

// Endpoint: Obtener usuarios
router.get('/usuarios', userController.getAllUsers);

// Endpoint: Crear usuario
router.post('/usuarios', userController.createUser);

// Endpoint: (login)
router.post('/login', userController.login);

// Ruta para validar el token
router.post('/validate-token', userController.validateToken);

module.exports = router;