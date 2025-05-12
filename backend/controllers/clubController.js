const db = require('../config/db');
const multer = require('multer');

// Configuración de multer para manejar la subida de archivos
const storage = multer.memoryStorage();
const upload = multer({ storage });

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

    getClubById: (req, res) => {
        const { id_club } = req.params;
        if (!id_club) {
            return res.status(400).json({ error: 'El ID del club es requerido' });
        }

        const sql = 'SELECT * FROM clubes WHERE id_club = ?';
        db.query(sql, [id_club], (err, result) => {
            if (err) {
                console.error('Error al obtener el club:', err);
                return res.status(500).json({ error: 'Error en el servidor' });
            }

            if (result.length === 0) {
                return res.status(404).json({ error: 'Club no encontrado' });
            }

            res.status(200).json(result[0]);
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

    deleteClub: (req, res) => {
        const { id_club } = req.params;
        if (!id_club) {
            return res.status(400).json({ error: 'El ID del club es requerido' });
        }

        const sql = 'DELETE FROM clubes WHERE id_club = ?';
        db.query(sql, [id_club], (err, result) => {
            if (err) {
                console.error('Error al borrar club:', err);
                return res.status(500).json({ error: 'Error en el servidor' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Club no encontrado' });
            }

            res.status(200).json({ message: 'Club borrado exitosamente' });
        });
    },

    updateClub: (req, res) => {
        const { id_club } = req.params;
        const { nombre, provincia, direccion, telefono, apertura, cierre, descripcion } = req.body;

        if (!id_club || !nombre || !provincia || !direccion || !telefono || !apertura || !cierre || !descripcion) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        const sql = `UPDATE clubes SET nombre = ?, provincia = ?, direccion = ?, telefono = ?, apertura = ?, cierre = ?, descripcion = ? WHERE id_club = ?`;
        const params = [nombre, provincia, direccion, telefono, apertura, cierre, descripcion, id_club];

        db.query(sql, params, (err, result) => {
            if (err) {
                console.error('Error al actualizar club:', err);
                return res.status(500).json({ error: 'Error en el servidor' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Club no encontrado' });
            }

            res.status(200).json({ message: 'Club actualizado exitosamente' });
        });
    },

    getClubByUserId: (req, res) => {
        const { id_usuario } = req.body;

        if (!id_usuario) {
            return res.status(400).json({ error: 'El ID del usuario es requerido' });
        }

        const sql = 'SELECT * FROM clubes WHERE id_usuario = ?';
        db.query(sql, [id_usuario], (err, results) => {
            if (err) {
                console.error('Error al obtener el club por ID de usuario:', err);
                return res.status(500).json({ error: 'Error en el servidor' });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'No se encontró un club para este usuario' });
            }

            res.status(200).json(results); // Devolver todos los resultados, no solo el primero
        });
    },

    uploadClubLogo: (req, res) => {
        
        const { id_club } = req.params;

        if (!id_club) {
            return res.status(400).json({ error: 'El ID del club es requerido' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No se ha subido ningún archivo' });
        }
        console.log(id_club);
        // Obtenemos información del archivo
        const buffer = req.file.buffer;
        const filename = req.file.originalname;
        const mimetype = req.file.mimetype;
        const size = req.file.size;

        // SQL para actualizar el campo BLOB y metadatos
        const sql = `
            UPDATE clubes
            SET logo = ?, logo_filename = ?, logo_mimetype = ?, logo_size = ?
            WHERE id_club = ?
        `;
        const params = [buffer, filename, mimetype, size, id_club];

        db.query(sql, params, (err, result) => {
            if (err) {
                console.error('Error al guardar BLOB en BD:', err);
                return res.status(500).json({ error: 'Error actualizando BD' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Club no encontrado' });
            }
            res.status(200).json({ message: 'Logo subido correctamente como BLOB' });
        });
    },

    getClubLogo: (req, res) => {
        const { id_club } = req.params;

        if (!id_club) {
            return res.status(400).json({ error: 'El ID del club es requerido' });
        }

        const sql = 'SELECT logo, logo_mimetype FROM clubes WHERE id_club = ?';
        db.query(sql, [id_club], (err, results) => {
            if (err) {
                console.error('Error al obtener el logo:', err);
                return res.status(500).json({ error: 'Error en el servidor' });
            }

            if (results.length === 0 || !results[0].logo) {
                return res.status(404).json({ error: 'Logo no encontrado' });
            }

            const { logo, logo_mimetype } = results[0];
            res.setHeader('Content-Type', logo_mimetype);
            res.send(logo);
        });
    }
  };

module.exports = {
    ...clubController,
    upload,           // <— añadimos export de upload
  };