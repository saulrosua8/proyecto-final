const express = require('express');
const router = express.Router();
const pistaController = require('../controllers/pistaController');
const stackHorarioController = require('../controllers/stackHorarioController'); // Importa el controlador

// Ruta para obtener todas las pistas
router.post('/', pistaController.getAllPistas);

// Ruta para crear una pista
router.post('/create', pistaController.crearPista);

// Ruta para borrar una pista
router.delete('/:id_pista', pistaController.borrarPista);

// Ruta para actualizar una pista
router.put('/:id_pista', pistaController.updatePista);

router.post('/generar-horarios', (req, res) => {
    stackHorarioController.generarHorariosDiarios();
    res.status(200).json({ message: 'Generación de horarios iniciada.' });
  });

module.exports = router;