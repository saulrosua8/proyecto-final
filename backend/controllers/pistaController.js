const db = require('../config/db');

// Crear pista
exports.crearPista = async (req, res) => {
  const { nombre, precio, tipo } = req.body;
  const id_club = req.user.id_club; // Se asume que el middleware de autenticación añade el id_club al usuario

  if (!nombre || !precio || !tipo) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const query = 'INSERT INTO pistas (nombre, precio, tipo, id_club) VALUES (?, ?, ?, ?)';
    await db.query(query, [nombre, precio, tipo, id_club]);
    res.status(201).json({ message: 'Pista creada exitosamente' });
  } catch (error) {
    console.error('Error al crear la pista:', error);
    res.status(500).json({ error: 'Error al crear la pista' });
  }
};

// Borrar pista
exports.borrarPista = async (req, res) => {
  const { id_pista } = req.params;

  try {
    const query = 'DELETE FROM pistas WHERE id_pista = ?';
    const [result] = await db.query(query, [id_pista]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Pista no encontrada' });
    }

    res.status(200).json({ message: 'Pista eliminada exitosamente' });
  } catch (error) {
    console.error('Error al borrar la pista:', error);
    res.status(500).json({ error: 'Error al borrar la pista' });
  }
};