import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminView = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [clubInfo, setClubInfo] = useState(null);
  const [pistas, setPistas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', tipo: '', precio: '' });

  useEffect(() => {
    if (user) {
      const fetchClubData = async () => {
        setLoading(true);
        try {
          const clubResponse = await fetch('http://localhost:3000/api/clubs/user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ id_usuario: user.id }), // Pasar el id del usuario en el cuerpo
          });
          if (!clubResponse.ok) {
            throw new Error('Error al obtener los datos del club');
          }
          const clubData = await clubResponse.json();
          setClubInfo(clubData);

          console.log(clubData);

          // Obtener las pistas de este club
          const pistasResponse = await fetch('http://localhost:3000/api/pistas', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id_club: clubData.id_club }), // Enviar el id_club del club
          });
          if (!pistasResponse.ok) {
            throw new Error('Error al obtener las pistas');
          }
          const pistasData = await pistasResponse.json();
          setPistas(pistasData);
        } catch (error) {
          console.error('Error al cargar los datos del club:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchClubData();
    }
  }, [user]);

  useEffect(() => {
    console.log('Usuario autenticado:', user); // Mostrar el contenido de user en consola
  }, [user]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/pistas/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, id_club: clubInfo.id_club }), // Asegúrate de que el id_club esté correcto
      });

      if (!response.ok) {
        throw new Error('Error al crear la pista');
      }

      const newPista = await response.json();
      setPistas([...pistas, newPista]); // Añadir la nueva pista a la lista de pistas
      setShowForm(false);
      setFormData({ nombre: '', tipo: '', precio: '' }); // Limpiar el formulario después de la creación
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="admin-view p-4">
      <header className="bg-teal-500 text-white p-4 rounded mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <a href="/dashboard">
            <img src="/src/assets/logo_blanco.png" alt="Logo" className="w-24 h-24 object-contain" />
          </a>
          <h1 className="text-2xl font-bold cursor-pointer" onClick={() => navigate('/dashboard')}>
            MatchPointRS
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="bg-teal-700 text-white px-4 py-2 rounded hover:bg-teal-800"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <h1 className="text-2xl font-bold">Panel de Administración</h1>
      <p className="text-gray-600">Gestiona las pistas y personalización de tu club.</p>

      <div className="grid grid-cols-3 gap-4 mt-4">
        {/* Pistas */}
        <div className="bg-white p-4 rounded shadow col-span-1">
          <h2 className="text-xl font-semibold">Pistas</h2>
          <ul className="mt-2">
            {pistas.map((pista) => (
              <li key={pista.id_pista} className="flex justify-between items-center py-2 border-b">
                <span>{pista.nombre}</span>
                <div>
                  <button className="text-blue-500 mr-2">Editar</button>
                  <button className="text-red-500">Eliminar</button>
                </div>
              </li>
            ))}
          </ul>
          <button
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
            onClick={() => setShowForm(true)}
          >
            + Nueva
          </button>

          {showForm && (
            <form onSubmit={handleFormSubmit} className="mt-4">
              <div className="mb-2">
                <label className="block text-gray-700">Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full border rounded px-2 py-1"
                  required
                />
              </div>
              <div className="mb-2">
                <label className="block text-gray-700">Tipo</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full border rounded px-2 py-1"
                  required
                >
                  <option value="">Seleccione un tipo</option>
                  <option value="Cubierta">Cubierta</option>
                  <option value="Exterior">Exterior</option>
                  <option value="Mixta">Mixta</option>
                </select>
              </div>
              <div className="mb-2">
                <label className="block text-gray-700">Precio por hora</label>
                <input
                  type="number"
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                  className="w-full border rounded px-2 py-1"
                  required
                />
              </div>
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="ml-2 bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancelar
              </button>
            </form>
          )}
        </div>

        {/* Personalización del Club */}
        <div className="bg-white p-4 rounded shadow col-span-2">
          <h2 className="text-xl font-semibold">{clubInfo?.nombre || 'Personalización del Club'}</h2>
          <div className="mt-4">
            <label className="block text-gray-700">Logo del Club</label>
            <input type="file" className="mt-2" />
          </div>
          <div className="mt-4">
            <label className="block text-gray-700">Color Principal</label>
            <input type="color" className="mt-2" />
          </div>
          <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">Ver Vista de Usuario</button>
        </div>
      </div>
    </div>
  );
};

export default AdminView;
