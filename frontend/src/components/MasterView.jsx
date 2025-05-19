import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import UserMenu from './UserMenu';
import toast from 'react-hot-toast';

function MasterView() {
  const [clubs, setClubs] = useState([]);
  const [form, setForm] = useState({
    id_club: null,
    nombre: '',
    provincia: '',
    direccion: '',
    telefono: '',
    apertura: '08:00',
    cierre: '22:00',
    descripcion: '',
    color: '#14b8a6',
    url_maps: '',
  });
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && user.rol !== 'Administrador') {
      navigate('/dashboard', { replace: true, state: { error: 'Acceso denegado' } });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    fetch('http://localhost:3000/api/clubs')
      .then((response) => response.json())
      .then((data) => setClubs(data))
      .catch((error) => console.error('Error al cargar los clubes:', error));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.id_club) {
        // Editar club existente
        const {
          id_club,
          nombre,
          provincia,
          direccion,
          telefono,
          apertura,
          cierre,
          descripcion,
          color,
          url_maps
        } = form;
        
        const promesaActualizacion = fetch(`http://localhost:3000/api/clubs/${form.id_club}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, provincia, direccion, telefono, apertura, cierre, descripcion, color, url_maps }),
        }).then(async (response) => {
            if (!response.ok) {
                throw new Error('Error al actualizar el club');
            }
            const data = await response.json();
            setClubs(clubs.map((club) => (club.id_club === form.id_club ? form : club)));
            setForm({
                id_club: null,
                nombre: '',
                provincia: '',
                direccion: '',
                telefono: '',
                apertura: '08:00',
                cierre: '22:00',
                descripcion: '',
                color: '#14b8a6',
                url_maps: '',
            });
            return data;
        });

        toast.promise(promesaActualizacion, {
            loading: 'Actualizando club...',
            success: (data) => {
                return (
                    <div className="flex flex-col gap-1">
                        <p className="font-semibold">¡Club actualizado con éxito!</p>
                        <p className="text-sm">Se han guardado todos los cambios</p>
                    </div>
                );
            },
            error: 'Error al actualizar el club. Por favor, inténtalo de nuevo.',
        }, {
            success: {
                duration: 5000,
                icon: '✅',
            },
            error: {
                duration: 4000,
                icon: '❌',
            },
        });

    } else {
        // Crear nuevo club
        const promesaCreacion = fetch('http://localhost:3000/api/clubs/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...form, id_usuario: 1 }), // ID de usuario administrador
        }).then(async (response) => {
            if (!response.ok) {
                throw new Error('Error al crear el club');
            }
            const data = await response.json();
            setClubs([...clubs, { ...form, id_club: data.id }]);
            setForm({
                id_club: null,
                nombre: '',
                provincia: '',
                direccion: '',
                telefono: '',
                apertura: '08:00',
                cierre: '22:00',
                descripcion: '',
                color: '#14b8a6',
                url_maps: '',
            });
            return data;
        });

        toast.promise(promesaCreacion, {
            loading: 'Creando nuevo club...',
            success: (data) => {
                return (
                    <div className="flex flex-col gap-1">
                        <p className="font-semibold">¡Club creado con éxito!</p>
                        <p className="text-sm">El nuevo club ha sido registrado en el sistema</p>
                    </div>
                );
            },
            error: 'Error al crear el club. Por favor, inténtalo de nuevo.',
        }, {
            success: {
                duration: 5000,
                icon: '✅',
            },
            error: {
                duration: 4000,
                icon: '❌',
            },
        });
    }
};

const handleDeleteClub = (id_club) => {
    toast((t) => (
        <div className="flex flex-col gap-2">
            <p className="font-semibold text-gray-800">¿Estás seguro de que deseas eliminar este club?</p>
            <p className="text-sm text-gray-600">Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-2">
                <button
                    className="px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    onClick={() => toast.dismiss(t.id)}
                >
                    Cancelar
                </button>
                <button
                    className="px-3 py-1 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                    onClick={async () => {
                        toast.dismiss(t.id);
                        const promesaEliminacion = fetch(`http://localhost:3000/api/clubs/${id_club}`, {
                            method: 'DELETE',
                        }).then(async (response) => {
                            if (!response.ok) {
                                throw new Error('Error al borrar el club');
                            }
                            setClubs(clubs.filter((club) => club.id_club !== id_club));
                            return await response.json();
                        });

                        toast.promise(promesaEliminacion, {
                            loading: 'Eliminando club...',
                            success: 'Club eliminado con éxito',
                            error: 'Error al eliminar el club',
                        }, {
                            success: {
                                duration: 5000,
                                icon: '✅',
                            },
                            error: {
                                duration: 4000,
                                icon: '❌',
                            },
                        });
                    }}
                >
                    Eliminar
                </button>
            </div>
        </div>
    ));
};

const handleEditClub = (id_club) => {
    const clubToEdit = clubs.find((club) => club.id_club === id_club);
    if (clubToEdit) {
        setForm({ ...clubToEdit });
    }
};

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white p-6 rounded-xl mb-8 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-6">
          <a href="/dashboard">
            <img src="/src/assets/logo_blanco.png" alt="Logo" className="w-20 h-20 object-contain" />
          </a>
          <h1
            className="text-3xl font-bold cursor-pointer hover:text-indigo-100 transition-colors"
            onClick={() => navigate('/dashboard')}
          >
            MatchPointRS
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <UserMenu />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-indigo-100">
          <h2 className="text-2xl font-bold mb-6 text-indigo-700 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {form.id_club ? 'Editar Club' : 'Crear Nuevo Club'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Nombre del Club</label>
              <input
                type="text"
                name="nombre"
                placeholder="Nombre del club"
                value={form.nombre}
                onChange={handleInputChange}
                className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Ciudad</label>
              <input
                type="text"
                name="provincia"
                placeholder="Ciudad donde se ubica"
                value={form.provincia}
                onChange={handleInputChange}
                className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Dirección</label>
              <input
                type="text"
                name="direccion"
                placeholder="Dirección completa"
                value={form.direccion}
                onChange={handleInputChange}
                className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Teléfono</label>
              <input
                type="text"
                name="telefono"
                placeholder="Número de teléfono"
                value={form.telefono}
                onChange={handleInputChange}
                className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all duration-200"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Hora de Apertura</label>
                <input
                  type="time"
                  name="apertura"
                  value={form.apertura}
                  onChange={handleInputChange}
                  className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all duration-200"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Hora de Cierre</label>
                <input
                  type="time"
                  name="cierre"
                  value={form.cierre}
                  onChange={handleInputChange}
                  className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all duration-200"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Descripción</label>
              <textarea
                name="descripcion"
                placeholder="Describe el club..."
                value={form.descripcion}
                onChange={handleInputChange}
                className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all duration-200 min-h-[100px]"
                required
              ></textarea>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Color del Club</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="color"
                  value={form.color}
                  onChange={handleInputChange}
                  className="w-20 h-10 border-2 border-indigo-200 rounded-lg cursor-pointer"
                  required
                />
                <span className="text-sm text-gray-600">Este color se usará en la interfaz del club</span>
              </div>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">URL de Google Maps</label>
              <input
                type="text"
                name="url_maps"
                placeholder="URL de la ubicación en Google Maps"
                value={form.url_maps}
                onChange={handleInputChange}
                className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all duration-200"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white py-3 rounded-lg font-bold text-lg shadow-lg hover:from-indigo-700 hover:to-indigo-600 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {form.id_club ? 'Actualizar Club' : 'Crear Club'}
            </button>
          </form>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg border border-indigo-100">
          <h2 className="text-2xl font-bold mb-6 text-indigo-700 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
            Lista de Clubs
          </h2>
          <div className="overflow-y-auto max-h-[600px] space-y-4">
            {clubs.map((club) => (
              <div key={club.id_club} 
                className="p-4 rounded-lg border border-indigo-100 hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-4">
                  <div 
                    style={{ width: 40, height: 40, background: club.color }} 
                    className="rounded-lg shadow-sm border border-gray-200"
                    title={club.color}
                  ></div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-800">{club.nombre}</h3>
                    <p className="text-gray-600 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.5-7.5 11.25-7.5 11.25S4.5 18 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      {club.provincia}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClub(club.id_club)}
                      className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-indigo-600 transition-all duration-200 flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteClub(club.id_club)}
                      className="bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-2 rounded-lg hover:from-red-700 hover:to-red-600 transition-all duration-200 flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                      Borrar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MasterView;