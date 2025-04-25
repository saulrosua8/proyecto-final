const express = require('express');
const db = require('./config/db');
const cors = require('cors'); // Agregar cors
require('dotenv').config();
const userRoutes = require('./routes/userRoutes');
const clubRoutes  = require('./routes/clubRoutes');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({  
    origin: ['http://localhost:5173', 'http://localhost:5174'], // o el puerto donde corre tu frontend
    credentials: true})); // Permitir solicitudes desde el frontend
app.use(express.json());

// Rutas
app.use('/api', userRoutes);
app.use('/api/clubs', clubRoutes);

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});