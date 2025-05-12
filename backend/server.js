const express = require('express');
const db = require('./config/db');
const cors = require('cors');
require('dotenv').config();
const userRoutes = require('./routes/userRoutes');
const clubRoutes = require('./routes/clubRoutes');
const pistaRoutes = require('./routes/pistaRoutes');
const reservasRoutes = require('./routes/reservasRoutes');
const stackHorarioRoutes = require('./routes/stackHorarioRoutes');
const stackHorarioController = require('./controllers/stackHorarioController'); // Importar el controlador
const cron = require('node-cron'); // Importar node-cron

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'], // o el puerto donde corre tu frontend
    credentials: true
})); // Permitir solicitudes desde el frontend
app.use(express.json());

// Rutas
app.use('/api', userRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/pistas', pistaRoutes);
app.use('/api/horarios', stackHorarioRoutes);
app.use('/api/reservas/', reservasRoutes);

// Programar la tarea para ejecutarse a las 00:00 cada día
cron.schedule('0 0 * * *', () => {
    console.log('⏰ Ejecutando tarea programada para generar horarios...');
    stackHorarioController.generarHorariosDiarios(); // Llamar al método para generar horarios
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
