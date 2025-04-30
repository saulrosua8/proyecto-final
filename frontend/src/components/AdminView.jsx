import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';

const AdminView = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [clubInfo, setClubInfo] = useState(null);
  const [pistas, setPistas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', tipo: '', precio: '' });
  const [editingPista, setEditingPista] = useState(null);

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

  const handleDeletePista = async (id_pista) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta pista?')) {
      try {
        const response = await fetch(`http://localhost:3000/api/pistas/${id_pista}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Error al eliminar la pista');
        }

        setPistas((prevPistas) => prevPistas.filter((pista) => pista.id_pista !== id_pista));
      } catch (error) {
        console.error('Error al eliminar la pista:', error);
      }
    }
  };

  const handleEditPista = (pista) => {
    setFormData({ nombre: pista.nombre, tipo: pista.tipo, precio: pista.precio });
    setShowForm(true);
    setEditingPista(pista.id_pista); // Guardar el ID de la pista que se está editando
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingPista ? 'PUT' : 'POST';
      const url = editingPista
        ? `http://localhost:3000/api/pistas/${editingPista}`
        : 'http://localhost:3000/api/pistas/create';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, id_club: clubInfo.id_club }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar la pista');
      }

      const data = await response.json();

      if (editingPista) {
        setPistas((prevPistas) =>
          prevPistas.map((pista) =>
            pista.id_pista === editingPista ? { ...pista, ...formData } : pista
          )
        );
      } else {
        setPistas((prevPistas) => [...prevPistas, data.pista]);
      }

      setShowForm(false);
      setFormData({ nombre: '', tipo: '', precio: '' });
      setEditingPista(null);
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
    }
  };

  const handleLogoUpload = async (e) => {
    if (!clubInfo || !clubInfo.id_club) {
      alert('No se ha cargado la información del club. Por favor, inténtalo de nuevo más tarde.');
      return;
    }
  
    const file = e.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append('logo', file);
  
    try {
      const response = await fetch(`http://localhost:3000/api/clubs/uploadClubLogo/${clubInfo.id_club}`, {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error('Error al subir el logo');
      }
  
      const data = await response.json();
      console.log(data.message);
      alert('Logo subido correctamente');
    } catch (error) {
      console.error('Error al subir el logo:', error);
      alert('Hubo un error al subir el logo');
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
                <div className="flex gap-2">
                  <button
                    className="text-blue-500 hover:text-blue-700"
                    onClick={() => handleEditPista(pista)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDeletePista(pista.id_pista)}
                  >
                    <FaTrash />
                  </button>
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
            <label className="block text-gray-700 font-semibold">Logo del Club</label>
            <input
              type="file"
              className="mt-2 block w-full text-sm text-gray-500
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-full file:border-0
                         file:text-sm file:font-semibold
                         file:bg-blue-50 file:text-blue-700
                         hover:file:bg-blue-100"
              onChange={handleLogoUpload}
            />
          </div>
          <div className="mt-4 flex items-center gap-4">
            <label className="block text-gray-700 font-semibold">Color Principal</label>
            <input
              type="color"
              className="w-16 h-8 border-2 border-gray-300 rounded cursor-pointer"
            />
            <span className="text-gray-600">Elige el color de tu club</span>
          </div>
          <button
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => navigate(`/club-view/${clubInfo?.id_club}`)}
          >
            Ver Vista de Usuario
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminView;
