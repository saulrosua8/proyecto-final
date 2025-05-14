const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const userController = {
    getAllUsers: (req, res) => {
        const query = 'SELECT * FROM usuarios';
        db.query(query, (err, results) => {
            if (err) {
                console.error('Error en la consulta:', err);
                res.status(500).json({ error: 'Error en el servidor' });
                return;
            }
            res.json(results);
        });
    },

    createUser: (req, res) => {
        const { nombre, email, contraseña } = req.body;
        if (!nombre || !email || !contraseña) {
            res.status(400).json({ error: 'Nombre, email y password son requeridos' });
            return;
        }
    
        // Hashear la contraseña
        bcrypt.hash(contraseña, 10, (err, hashedPassword) => {
            if (err) {
                console.error('Error al hashear la contraseña:', err);
                res.status(500).json({ error: 'Error en el servidor' });
                return;
            }
    
            console.log('Datos recibidos:', req.body); // <-- AGREGAR ESTO
            
            const checkQuery = 'SELECT * FROM usuarios WHERE email = ?';
            db.query(checkQuery,email , (err, results) => {
                if (err) {
                    console.error('Error en la consulta:', err);
                    res.status(500).json({ error: 'Error en el servidor' });
                    return;
                }
    
                // Verificar si results es undefined o si no se encuentran registros
                if (results && results.length > 0) {
                    return res.status(400).json({ error: 'El email ya está en uso' });
                }
                
                const query = 'INSERT INTO usuarios (nombre, email, contraseña, rol) VALUES (?, ?, ?, "Cliente")';
                db.query(query, [nombre, email, hashedPassword], (err, result) => {
                    if (err) {
                        console.error('Error al crear usuario:', err);
                        res.status(500).json({ error: 'Error en el servidor' });
                        return;
                    }
                    res.status(201).json({ message: 'Usuario creado', id: result.insertId });
                });
            });
        });
    },
    
    login: (req, res) => {
        const { email, contraseña } = req.body;

        if (!email || !contraseña) {
            res.status(400).json({ error: 'email y contraseña son requeridos' });
            return;
        }

        const query = 'SELECT * FROM usuarios WHERE email = ?';
        db.query(query, [email], (err, results) => {
            if (err) {
                console.error('Error en la consulta:', err);
                res.status(500).json({ error: 'Error en el servidor' });
                return;
            }

            if (results.length === 0) {
                res.status(401).json({ error: 'Credenciales inválidas' });
                return;
            }

            const user = results[0];

            // Comparar la contraseña ingresada con la hasheada
            bcrypt.compare(contraseña, user.contraseña, (err, isMatch) => {
                if (err) {
                    console.error('Error al comparar contraseñas:', err);
                    res.status(500).json({ error: 'Error en el servidor' });
                    return;
                }

                if (!isMatch) {
                    res.status(401).json({ error: 'Credenciales inválidas' });
                    return;
                }                // Generar el token JWT
                const token = jwt.sign(
                    { id: user.id_usuario, nombre: user.nombre, email: user.email, rol: user.rol },
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' } // Token válido por 1 hora
                );

                res.json({
                    message: 'Login exitoso',
                    user: {
                        id: user.id_usuario,
                        nombre: user.nombre,
                        email: user.email,
                        rol: user.rol
                    },
                    token // Enviar el token al cliente
                });
            });
        });
    },

    validateToken: (req, res) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }

        const token = authHeader.split(' ')[1];        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ error: 'Token inválido' });
            }

            res.json({ user: decoded });
        });
    },
};

module.exports = userController;