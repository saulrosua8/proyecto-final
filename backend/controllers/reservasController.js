const db = require('../config/db');

// Controlador para crear una reserva
const reservasController = {
    
    crearReserva: (req, res) => {
        console.log('📥 Entrando al controlador crearReserva');
        console.log('Datos recibidos:', req.body);

        const { id_horario, id_usuario, precio } = req.body;

        if (!id_horario || !id_usuario || !precio) {
            console.log('❌ Faltan datos obligatorios');
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        console.log('Valores esperados:', { id_horario, id_usuario, precio });

        // Primero obtenemos la fecha del horario
        db.query(
            'SELECT fecha FROM horarios_stack WHERE id_horario = ?',
            [id_horario],
            (error, results) => {
                if (error) {
                    console.error('❌ Error al obtener la fecha del horario:', error);
                    return res.status(500).json({ error: 'Error al obtener la fecha del horario' });
                }

                if (results.length === 0) {
                    return res.status(404).json({ error: 'Horario no encontrado' });
                }

                const fecha = results[0].fecha;

                // Luego creamos la reserva con la fecha
                db.query(
                    'INSERT INTO reservas (id_horario, id_usuario, precio, fecha) VALUES (?, ?, ?, ?)',
                    [id_horario, id_usuario, precio, fecha],
                    (error, resultado) => {
                        if (error) {
                            console.error('❌ Error al crear la reserva:', error);
                            return res.status(500).json({ error: 'Error al crear la reserva' });
                        }

                        console.log('✅ Reserva creada exitosamente con ID:', resultado.insertId);

                        // Actualizar el estado del horario a "reservado"
                        db.query(
                            'UPDATE horarios_stack SET disponibilidad = ? WHERE id_horario = ?',
                            ['reservado', id_horario],
                            (updateError) => {
                                if (updateError) {
                                    console.error('❌ Error al actualizar el estado del horario:', updateError);
                                    return res.status(500).json({ error: 'Error al actualizar el estado del horario' });
                                }

                                console.log('✅ Estado del horario actualizado a "reservado"');
                                res.status(201).json({
                                    message: 'Reserva creada exitosamente',
                                    reservaId: resultado.insertId
                                });
                            }
                        );
                    }
                );
            }
        );
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
    }
};

module.exports = reservasController;