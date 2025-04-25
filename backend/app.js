const express = require('express');
const bodyParser = require('body-parser');
const clubRoutes = require('./routes/clubRoutes');

const app = express();

// Middleware para parsear JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Montar las rutas de clubes
app.use('/api/clubs', clubRoutes);

// Manejo de errores para rutas no encontradas
app.use((req, res) => {
    res.status(404).send({ error: 'Ruta no encontrada' });
});

module.exports = app;