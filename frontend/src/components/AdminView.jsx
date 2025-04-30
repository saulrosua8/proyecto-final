import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminView = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [clubInfo, setClubInfo] = useState(null);
  const [pistas, setPistas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClubData = async () => {
      setLoading(true);
      try {
        if (!user?.id_club) {
          console.error('El usuario no tiene un id_club válido.');
          return;
        }

        const clubResponse = await fetch(`/api/clubs/${user.id_club}`);
        if (!clubResponse.ok) {
          throw new Error('Error al obtener los datos del club');
        }
        const clubData = await clubResponse.json();
        setClubInfo(clubData);

        const pistasResponse = await fetch(`/api/pistas?clubId=${user.id_club}`);
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
  }, [user]);

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
          <h1
            className="text-2xl font-bold cursor-pointer"
            onClick={() => navigate('/dashboard')}
          >
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
          <button className="mt-4 bg-green-500 text-white px-4 py-2 rounded">+ Nueva</button>
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