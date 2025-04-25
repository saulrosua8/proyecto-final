const db = require('../config/db');

const clubController = {
    getAllClubs: (req, res) => {
        const sql = 'SELECT * FROM clubes';
        db.query(sql, (err, results) => {
            if (err) {
                console.error('Error al obtener clubes:', err);
                return res.status(500).json({ error: 'Error en el servidor' });
            }
            res.setHeader('Content-Type', 'application/json'); // Asegurar encabezado JSON
            res.json(results);
        });
    },

    searchClubs: (req, res) => {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ error: 'El parámetro "query" es requerido' });
        }

        const sql = `
            SELECT * FROM clubes
            WHERE nombre LIKE ? OR provincia LIKE ?
        `;
        const params = [`%${query}%`, `%${query}%`];

        db.query(sql, params, (err, results) => {
            if (err) {
                console.error('Error en la consulta:', err);
                return res.status(500).json({ error: 'Error en el servidor' });
            }
            res.setHeader('Content-Type', 'application/json'); // Asegurar encabezado JSON
            res.json(results);
        });
    },

    createClub: (req, res) => {
        const { nombre, provincia, direccion, telefono, id_usuario, apertura, cierre, descripcion } = req.body;
        if (!nombre || !provincia || !direccion || !telefono || !id_usuario || !apertura || !cierre || !descripcion) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        const sql = `INSERT INTO clubes (nombre, provincia, direccion, telefono, id_usuario, apertura, cierre, descripcion) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const params = [nombre, provincia, direccion, telefono, id_usuario, apertura, cierre, descripcion];

        db.query(sql, params, (err, result) => {
            if (err) {
                console.error('Error al crear club:', err);
                return res.status(500).json({ error: 'Error en el servidor' });
            }
            res.status(201).json({ message: 'Club creado exitosamente', id: result.insertId });
        });
    },
};

module.exports = clubController;
