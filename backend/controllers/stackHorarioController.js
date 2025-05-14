const db = require('../config/db');
const dayjs = require('dayjs');

const stackHorarioController = {
    generarHorariosDiarios() {
        console.log('⏰ Iniciando generación de horarios...');

        const fechaAEliminar = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
        const fechaAGenerar = dayjs().add(8, 'day').format('YY1Y-MM-DD');

        // 1. Eliminar horarios antiguos SOLO si NO están reservados
        const deleteQuery = "DELETE FROM horarios_stack WHERE fecha = ? AND disponibilidad = 'disponible'";
        db.query(deleteQuery, [fechaAEliminar], (err, result) => {
            if (err) {
                console.error('❌ Error al eliminar horarios:', err);
                return;
            }
            console.log(`🗑️ Eliminados horarios del ${fechaAEliminar}`);

            // 2. Obtener los clubes
            const selectClubesQuery = 'SELECT * FROM clubes';
            db.query(selectClubesQuery, (err, clubes) => {
                if (err) {
                    console.error('❌ Error al obtener los clubes:', err);
                    return;
                }

                console.log(`📍 Encontrados ${clubes.length} clubes`);
                
                // Iterar sobre cada club
                clubes.forEach((club) => {
                    console.log(`\n🏢 Procesando club ${club.id_club} - ${club.nombre}`);
                    console.log(`⏰ Horario del club: ${club.apertura} - ${club.cierre}`);
                    
                    const apertura = dayjs(`1970-01-01T${club.apertura}`);
                    const cierre = dayjs(`1970-01-01T${club.cierre}`);

                    // Obtener las pistas de cada club
                    const selectPistasQuery = 'SELECT * FROM pistas WHERE id_club = ?';
                    db.query(selectPistasQuery, [club.id_club], (err, pistas) => {
                        if (err) {
                            console.error(`❌ Error al obtener las pistas del club ${club.id_club}:`, err);
                            return;
                        }

                        console.log(`🎾 Encontradas ${pistas.length} pistas para el club ${club.id_club}`);
                        
                        // Iterar sobre cada pista
                        pistas.forEach((pista) => {
                            console.log(`\n🎯 Generando horarios para pista ${pista.id_pista} - ${pista.nombre}`);
                            console.log(`⌚ Duración: ${pista.duracion} minutos, Precio: ${pista.precio}€`);
                            
                            const duracion = parseInt(pista.duracion, 10);
                            const precio = pista.precio;
                            
                            // Generar horarios para cada pista
                            let currentTime = apertura;
                            let horariosGenerados = 0;

                            while (currentTime.isBefore(cierre)) {
                                const horaInicio = currentTime.clone(); // Importante: clonar para no modificar currentTime
                                const horaFin = horaInicio.add(duracion, 'minute');

                                // Solo crear el horario si no excede la hora de cierre
                                if (!horaFin.isAfter(cierre)) {
                                    // Insertar el horario en la base de datos
                                    const insertHorarioQuery = `
                                        INSERT INTO horarios_stack (id_pista, fecha, hora_inicio, hora_fin, precio, disponibilidad)
                                        VALUES (?, ?, ?, ?, ?, 'disponible')
                                    `;
                                    db.query(
                                        insertHorarioQuery,
                                        [
                                            pista.id_pista,
                                            fechaAGenerar,
                                            horaInicio.format('HH:mm:ss'),
                                            horaFin.format('HH:mm:ss'),
                                            precio
                                        ],
                                        (err, result) => {
                                            if (err) {
                                                console.error(`❌ Error al insertar horario para pista ${pista.id_pista}:`, err);
                                                return;
                                            }
                                            console.log(`✅ Horario generado para la pista ${pista.id_pista} a las ${horaInicio.format('HH:mm:ss')}`);
                                        }
                                    );
                                    horariosGenerados++;
                                }
                                currentTime = currentTime.add(duracion, 'minute');
                            }
                            console.log(`📊 Total horarios generados para pista ${pista.id_pista}: ${horariosGenerados}`);
                        });
                    });
                });
            });
        });
    },

    getHorariosByClubAndFecha: async (req, res) => {
        const { id_club, fecha } = req.params;
        

        try {
            const query = `
                SELECT hs.*, p.nombre as nombre_pista, p.tipo as tipo_pista, p.duracion
                FROM horarios_stack hs
                INNER JOIN pistas p ON hs.id_pista = p.id_pista
                WHERE p.id_club = ? AND hs.fecha = ?
                ORDER BY p.nombre, hs.hora_inicio
            `;

         
            db.query(query, [id_club, fecha], (err, results) => {
                if (err) {
                    console.error('❌ Error al obtener horarios:', err);
                    return res.status(500).json({ error: 'Error al obtener los horarios' });
                }


                // Agrupar horarios por pista
                const horariosPorPista = {};
                results.forEach(horario => {
                    if (!horariosPorPista[horario.nombre_pista]) {
                        horariosPorPista[horario.nombre_pista] = {
                            id_pista: horario.id_pista,
                            nombre: horario.nombre_pista,
                            tipo: horario.tipo_pista,
                            duracion: horario.duracion,
                            horarios: []
                        };
                    }
                    horariosPorPista[horario.nombre_pista].horarios.push({
                        id_horario: horario.id_horario,
                        hora_inicio: horario.hora_inicio,
                        hora_fin: horario.hora_fin,
                        precio: horario.precio,
                        disponibilidad: horario.disponibilidad
                    });
                });

                const response = Object.values(horariosPorPista);

                res.json(response);
            });
        } catch (error) {
            console.error('❌ Error:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },

    async toggleDisponibilidad(req, res) {
        const { id_horario } = req.params;

        try {
            // Obtener la disponibilidad actual del horario
            const selectQuery = 'SELECT disponibilidad FROM horarios_stack WHERE id_horario = ?';
            db.query(selectQuery, [id_horario], (err, results) => {
                if (err) {
                    console.error('❌ Error al obtener la disponibilidad:', err);
                    return res.status(500).json({ error: 'Error al obtener la disponibilidad' });
                }

                if (results.length === 0) {
                    return res.status(404).json({ error: 'Horario no encontrado' });
                }

                const disponibilidadActual = results[0].disponibilidad;
                const nuevaDisponibilidad = disponibilidadActual === 'disponible' ? 'reservado' : 'disponible';

                // Actualizar la disponibilidad
                const updateQuery = 'UPDATE horarios_stack SET disponibilidad = ? WHERE id_horario = ?';
                db.query(updateQuery, [nuevaDisponibilidad, id_horario], (err, result) => {
                    if (err) {
                        console.error('❌ Error al actualizar la disponibilidad:', err);
                        return res.status(500).json({ error: 'Error al actualizar la disponibilidad' });
                    }

                    res.json({
                        message: 'Disponibilidad actualizada correctamente',
                        nuevaDisponibilidad
                    });
                });
            });
        } catch (error) {
            console.error('❌ Error interno:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
};

module.exports = stackHorarioController;
