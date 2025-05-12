const db = require('../config/db');

const reservasController = {
    crearReserva: (req, res) => {
        console.log('📥 Entrando al controlador crearReserva');
        console.log('Datos recibidos:', req.body);

        const { id_horario, id_usuario, precio } = req.body;

        if (!id_horario || !id_usuario || !precio) {
            console.log('❌ Faltan datos obligatorios');
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        // Obtener datos del horario y crear la reserva en una transacción
        db.beginTransaction(err => {
            if (err) {
                console.error('❌ Error al iniciar la transacción:', err);
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            // Paso 1: Obtener datos del horario
            db.query(
                'SELECT fecha, hora_inicio, hora_fin FROM horarios_stack WHERE id_horario = ?',
                [id_horario],
                (error, results) => {
                    if (error) {
                        return db.rollback(() => {
                            console.error('❌ Error al obtener los datos del horario:', error);
                            res.status(500).json({ error: 'Error al obtener los datos del horario' });
                        });
                    }

                    if (results.length === 0) {
                        return db.rollback(() => {
                            res.status(404).json({ error: 'Horario no encontrado' });
                        });
                    }

                    const { fecha, hora_inicio, hora_fin } = results[0];

                    // Paso 2: Crear la reserva
                    db.query(
                        'INSERT INTO reservas (id_horario, id_usuario, precio, fecha, hora_inicio, horario_fin) VALUES (?, ?, ?, ?, ?, ?)',
                        [id_horario, id_usuario, precio, fecha, hora_inicio, hora_fin],
                        (error, resultado) => {
                            if (error) {
                                return db.rollback(() => {
                                    console.error('❌ Error al crear la reserva:', error);
                                    res.status(500).json({ error: 'Error al crear la reserva' });
                                });
                            }

                            // Paso 3: Actualizar estado del horario
                            db.query(
                                'UPDATE horarios_stack SET disponibilidad = ? WHERE id_horario = ?',
                                ['reservado', id_horario],
                                (updateError) => {
                                    if (updateError) {
                                        return db.rollback(() => {
                                            console.error('❌ Error al actualizar el estado del horario:', updateError);
                                            res.status(500).json({ error: 'Error al actualizar el estado del horario' });
                                        });
                                    }

                                    // Commit de la transacción
                                    db.commit(err => {
                                        if (err) {
                                            return db.rollback(() => {
                                                console.error('❌ Error al finalizar la transacción:', err);
                                                res.status(500).json({ error: 'Error al finalizar la transacción' });
                                            });
                                        }

                                        console.log('✅ Reserva creada exitosamente con ID:', resultado.insertId);
                                        res.status(201).json({
                                            message: 'Reserva creada exitosamente',
                                            reservaId: resultado.insertId
                                        });
                                    });
                                }
                            );
                        }
                    );
                }
            );
        });
    },

    getReservasPorFecha: (req, res) => {
        const { fecha } = req.params;

        if (!fecha) {
            return res.status(400).json({ error: 'La fecha es obligatoria' });
        }

        db.query(
            'SELECT r.id_reserva, r.precio, h.hora_inicio, h.hora_fin, p.nombre AS pista, u.nombre AS usuario FROM reservas r JOIN horarios_stack h ON r.id_horario = h.id_horario JOIN pistas p ON h.id_pista = p.id_pista JOIN usuarios u ON r.id_usuario = u.id_usuario WHERE r.fecha = ?',
            [fecha],
            (error, resultados) => {
                if (error) {
                    console.error('Error al obtener las reservas:', error);
                    return res.status(500).json({ error: 'Error al obtener las reservas' });
                }

                res.status(200).json(resultados);
            }
        );
    },

    getReservasByDate: (req, res) => {
        const { fecha } = req.params;
        const { id_club } = req.query;

        if (!fecha || !id_club) {
            return res.status(400).json({ error: 'La fecha y el id_club son requeridos' });
        }

        db.query(
            `SELECT r.id_reserva, r.precio, h.hora_inicio, h.hora_fin, p.nombre AS pista, 
            u.nombre AS usuario, c.nombre AS club 
            FROM reservas r 
            JOIN horarios_stack h ON r.id_horario = h.id_horario 
            JOIN pistas p ON h.id_pista = p.id_pista 
            JOIN usuarios u ON r.id_usuario = u.id_usuario 
            JOIN clubes c ON p.id_club = c.id_club 
            WHERE r.fecha = ? AND c.id_club = ?
            ORDER BY h.hora_inicio`,
            [fecha, id_club],
            (error, resultados) => {
                if (error) {
                    console.error('Error al obtener las reservas:', error);
                    return res.status(500).json({ error: 'Error al obtener las reservas' });
                }

                res.status(200).json(resultados);
            }
        );
    },

    getReservasUsuario: (req, res) => {
        const { id_usuario } = req.params;
        const currentDate = new Date().toISOString().split('T')[0];

        // Consulta actualizada para obtener las reservas del usuario
        const query = `
            SELECT 
                r.id_reserva,
                r.fecha,
                r.precio,
                h.hora_inicio,
                h.hora_fin,
                p.nombre AS pista_nombre,
                c.nombre AS club_nombre
            FROM reservas r
            JOIN horarios_stack h ON r.id_horario = h.id_horario
            JOIN pistas p ON h.id_pista = p.id_pista
            JOIN clubes c ON p.id_club = c.id_club
            WHERE r.id_usuario = ?
            ORDER BY r.fecha DESC, h.hora_inicio DESC`;

        db.query(query, [id_usuario], (error, resultados) => {
            if (error) {
                console.error('Error al obtener las reservas del usuario:', error);
                return res.status(500).json({ error: 'Error al obtener las reservas' });
            }            console.log('Resultados de la consulta:', resultados); // Para depuración
            console.log('Fecha actual:', currentDate);

            // Convertir las fechas para poder compararlas correctamente
            const reservas = {
                proximas: resultados.filter(r => {
                    // Convertir la fecha de la reserva al formato YYYY-MM-DD
                    const fechaReserva = new Date(r.fecha).toISOString().split('T')[0];
                    console.log(`Comparando fechaReserva: ${fechaReserva} con currentDate: ${currentDate}`);
                    return fechaReserva >= currentDate;
                }),
                anteriores: resultados.filter(r => {
                    const fechaReserva = new Date(r.fecha).toISOString().split('T')[0];
                    return fechaReserva < currentDate;
                })
            };

            console.log('Reservas procesadas:', reservas);
            res.status(200).json(reservas);
        });
    },

    cancelarReserva: (req, res) => {
        const { id_reserva } = req.params;

        if (!id_reserva) {
            return res.status(400).json({ error: 'El ID de la reserva es obligatorio' });
        }

        // Iniciar transacción
        db.beginTransaction(err => {
            if (err) {
                console.error('❌ Error al iniciar la transacción:', err);
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            // Paso 1: Obtener el id_horario de la reserva
            db.query(
                'SELECT id_horario FROM reservas WHERE id_reserva = ?',
                [id_reserva],
                (error, results) => {
                    if (error) {
                        return db.rollback(() => {
                            console.error('❌ Error al obtener el horario de la reserva:', error);
                            res.status(500).json({ error: 'Error al obtener el horario de la reserva' });
                        });
                    }

                    if (results.length === 0) {
                        return db.rollback(() => {
                            res.status(404).json({ error: 'Reserva no encontrada' });
                        });
                    }

                    const { id_horario } = results[0];

                    // Paso 2: Eliminar la reserva
                    db.query(
                        'DELETE FROM reservas WHERE id_reserva = ?',
                        [id_reserva],
                        (deleteError) => {
                            if (deleteError) {
                                return db.rollback(() => {
                                    console.error('❌ Error al eliminar la reserva:', deleteError);
                                    res.status(500).json({ error: 'Error al eliminar la reserva' });
                                });
                            }

                            // Paso 3: Actualizar la disponibilidad del horario a "disponible"
                            db.query(
                                'UPDATE horarios_stack SET disponibilidad = ? WHERE id_horario = ?',
                                ['disponible', id_horario],
                                (updateError) => {
                                    if (updateError) {
                                        return db.rollback(() => {
                                            console.error('❌ Error al actualizar el estado del horario:', updateError);
                                            res.status(500).json({ error: 'Error al actualizar el estado del horario' });
                                        });
                                    }

                                    // Commit de la transacción
                                    db.commit(err => {
                                        if (err) {
                                            return db.rollback(() => {
                                                console.error('❌ Error al finalizar la transacción:', err);
                                                res.status(500).json({ error: 'Error al finalizar la transacción' });
                                            });
                                        }

                                        console.log('✅ Reserva cancelada exitosamente');
                                        res.status(200).json({
                                            message: 'Reserva cancelada exitosamente'
                                        });
                                    });
                                }
                            );
                        }
                    );
                }
            );
        });
    },


    cancelarReserva: (req, res) => {
        const { id_reserva } = req.params;

        if (!id_reserva) {
            return res.status(400).json({ error: 'El ID de la reserva es obligatorio' });
        }

        // Iniciar transacción
        db.beginTransaction(err => {
            if (err) {
                console.error('❌ Error al iniciar la transacción:', err);
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            // Paso 1: Obtener el id_horario de la reserva
            db.query(
                'SELECT id_horario FROM reservas WHERE id_reserva = ?',
                [id_reserva],
                (error, results) => {
                    if (error) {
                        return db.rollback(() => {
                            console.error('❌ Error al obtener el horario de la reserva:', error);
                            res.status(500).json({ error: 'Error al obtener el horario de la reserva' });
                        });
                    }

                    if (results.length === 0) {
                        return db.rollback(() => {
                            res.status(404).json({ error: 'Reserva no encontrada' });
                        });
                    }

                    const { id_horario } = results[0];

                    // Paso 2: Eliminar la reserva
                    db.query(
                        'DELETE FROM reservas WHERE id_reserva = ?',
                        [id_reserva],
                        (deleteError) => {
                            if (deleteError) {
                                return db.rollback(() => {
                                    console.error('❌ Error al eliminar la reserva:', deleteError);
                                    res.status(500).json({ error: 'Error al eliminar la reserva' });
                                });
                            }

                            // Paso 3: Actualizar la disponibilidad del horario a "disponible"
                            db.query(
                                'UPDATE horarios_stack SET disponibilidad = ? WHERE id_horario = ?',
                                ['disponible', id_horario],
                                (updateError) => {
                                    if (updateError) {
                                        return db.rollback(() => {
                                            console.error('❌ Error al actualizar el estado del horario:', updateError);
                                            res.status(500).json({ error: 'Error al actualizar el estado del horario' });
                                        });
                                    }

                                    // Commit de la transacción
                                    db.commit(err => {
                                        if (err) {
                                            return db.rollback(() => {
                                                console.error('❌ Error al finalizar la transacción:', err);
                                                res.status(500).json({ error: 'Error al finalizar la transacción' });
                                            });
                                        }

                                        console.log('✅ Reserva cancelada exitosamente');
                                        res.status(200).json({
                                            message: 'Reserva cancelada exitosamente'
                                        });
                                    });
                                }
                            );
                        }
                    );
                }
            );
        });
    }
};

module.exports = reservasController;