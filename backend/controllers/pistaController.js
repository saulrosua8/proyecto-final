const db = require('../config/db');

const pistaController = {
    crearPista: (req, res) => {
        const { nombre, precio, tipo, id_club } = req.body; // Asegurarse de que id_club venga en el cuerpo

        if (!nombre || !precio || !tipo || !id_club) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios, incluyendo id_club' });
        }

        const query = 'INSERT INTO pistas (nombre, precio, tipo, id_club) VALUES (?, ?, ?, ?)';
        db.query(query, [nombre, precio, tipo, id_club], (err, result) => {
            if (err) {
                console.error('Error al crear la pista:', err);
                return res.status(500).json({ error: 'Error al crear la pista' });
            }

            res.status(201).json({ 
                message: 'Pista creada exitosamente',
                pista: { id_pista: result.insertId, nombre, precio, tipo, id_club } // Devolver la pista creada
            });
        });
    },

    borrarPista: (req, res) => {
        const { id_pista } = req.params;

        if (!id_pista) {
            return res.status(400).json({ error: 'El ID de la pista es requerido' });
        }

        const query = 'DELETE FROM pistas WHERE id_pista = ?';
        db.query(query, [id_pista], (err, result) => {
            if (err) {
                console.error('Error al borrar la pista:', err);
                return res.status(500).json({ error: 'Error al borrar la pista' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Pista no encontrada' });
            }

            res.status(200).json({ message: 'Pista eliminada exitosamente' });
        });
    },

    getAllPistas: (req, res) => {

        const { id_club } = req.body; // Obtener el parámetro id_club del cuerpo de la solicitud

        if (!id_club) {
            return res.status(400).json({ error: 'El id_club es obligatorio' });
        }

        const query = 'SELECT * FROM pistas WHERE id_club = ?';
        db.query(query, [id_club], (err, results) => {
            if (err) {
                console.error('Error al obtener pistas:', err);
                return res.status(500).json({ error: 'Error en el servidor' });
            }

            res.setHeader('Content-Type', 'application/json');
            res.json(results);
        });
    },

    updatePista: (req, res) => {
        const { id_pista } = req.params;
        const { nombre, precio, tipo } = req.body;

        if (!id_pista || !nombre || !precio || !tipo) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        const query = 'UPDATE pistas SET nombre = ?, precio = ?, tipo = ? WHERE id_pista = ?';
        db.query(query, [nombre, precio, tipo, id_pista], (err, result) => {
            if (err) {
                console.error('Error al actualizar la pista:', err);
                return res.status(500).json({ error: 'Error al actualizar la pista' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Pista no encontrada' });
            }

            res.status(200).json({ message: 'Pista actualizada exitosamente' });
        });
    }
};

module.exports = pistaController;
