import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import UserMenu from './UserMenu';
import Spinner from './Spinner';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import toast from 'react-hot-toast';
Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend);

const AdminView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clubes, setClubes] = useState([]);
  const [clubSeleccionado, setClubSeleccionado] = useState(null);
  const [clubInfo, setClubInfo] = useState(null);
  const [pistas, setPistas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', tipo: '', precio: '', duracion: '' });
  const [editingPista, setEditingPista] = useState(null);
  const [pistasMasReservadas, setPistasMasReservadas] = useState(null);
  const [horasMasReservadas, setHorasMasReservadas] = useState(null);
  const [clientesMasReservas, setClientesMasReservas] = useState(null);
  const [ganancias, setGanancias] = useState(null);
  const [color, setColor] = useState('#14b8a6'); // Color por defecto

  useEffect(() => {
    if (user && !['Administrador', 'Club'].includes(user.rol)) {
      navigate('/dashboard', { replace: true, state: { error: 'Acceso denegado' } });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      const fetchClubes = async () => {
        setLoading(true);
        try {
          const clubResponse = await fetch('http://localhost:3000/api/clubs/user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ id_usuario: user.id }),
          });
          if (!clubResponse.ok) {
            throw new Error('Error al obtener los datos de los clubes');
          }
          const clubesData = await clubResponse.json();
          setClubes(Array.isArray(clubesData) ? clubesData : [clubesData]);
          
          // Si hay clubes, seleccionar el primero por defecto
          if (clubesData.length > 0) {
            setClubSeleccionado(clubesData[0].id_club);
            setClubInfo(clubesData[0]);
            
            // Cargar las pistas del club seleccionado
            const pistasResponse = await fetch('http://localhost:3000/api/pistas', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ id_club: clubesData[0].id_club }),
            });
            if (!pistasResponse.ok) {
              throw new Error('Error al obtener las pistas');
            }
            const pistasData = await pistasResponse.json();
            setPistas(pistasData);
          }
        } catch (error) {
          console.error('Error al cargar los datos:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchClubes();
    }
  }, [user]);

  const handleClubChange = async (id_club) => {
    setClubSeleccionado(id_club);
    const clubSeleccionadoInfo = clubes.find(club => club.id_club === parseInt(id_club));
    setClubInfo(clubSeleccionadoInfo);
    
    try {
      const pistasResponse = await fetch('http://localhost:3000/api/pistas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_club: id_club }),
      });
      if (!pistasResponse.ok) {
        throw new Error('Error al obtener las pistas');
      }
      const pistasData = await pistasResponse.json();
      setPistas(pistasData);
    } catch (error) {
      console.error('Error al cargar las pistas:', error);
    }
  };

  useEffect(() => {

  }, [user]);

  const handleDeletePista = async (id_pista) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="font-semibold text-gray-800">¿Estás seguro de que deseas eliminar esta pista?</p>
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
              try {
                const response = await fetch(`http://localhost:3000/api/pistas/${id_pista}`, {
                  method: 'DELETE',
                });

                if (!response.ok) {
                  throw new Error('Error al eliminar la pista');
                }

                setPistas((prevPistas) => prevPistas.filter((pista) => pista.id_pista !== id_pista));
                toast.success('Pista eliminada correctamente');
              } catch (error) {
                toast.error('Error al eliminar la pista');
                console.error('Error al eliminar la pista:', error);
              }
            }}
          >
            Eliminar
          </button>
        </div>
      </div>
    ), {
      duration: 6000,
      position: 'top-center',
      style: {
        minWidth: '300px',
      },
    });
  };

  const handleEditPista = (pista) => {
    setFormData({ 
      nombre: pista.nombre, 
      tipo: pista.tipo, 
      precio: pista.precio,
      duracion: pista.duracion.toString() // Convertir a string para el select
    });
    setShowForm(true);
    setEditingPista(pista.id_pista);
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
      setFormData({ nombre: '', tipo: '', precio: '', duracion: '' });
      setEditingPista(null);
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
    }
  };

  const handleLogoUpload = async (e) => {
    if (!clubInfo || !clubInfo.id_club) {
      toast.error('No se ha cargado la información del club. Por favor, inténtalo de nuevo más tarde.');
      return;
    }
  
    const file = e.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append('logo', file);
  
    const promesaSubida = fetch(`http://localhost:3000/api/clubs/uploadClubLogo/${clubInfo.id_club}`, {
      method: 'POST',
      body: formData,
    });

    toast.promise(promesaSubida, {
      loading: 'Subiendo logo...',
      success: 'Logo subido correctamente',
      error: 'Error al subir el logo',
    });
  };

  const handleColorChange = async (e) => {
    const newColor = e.target.value;
    setColor(newColor);
    if (clubInfo?.id_club) {
      const promesaColor = fetch(`http://localhost:3000/api/clubs/${clubInfo.id_club}/color`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ color: newColor })
      });

      toast.promise(promesaColor, {
        loading: 'Actualizando color...',
        success: 'Color actualizado correctamente',
        error: 'Error al actualizar el color',
      });
    }
  };

  useEffect(() => {
    if (clubInfo?.color) {
      setColor(clubInfo.color);
    } else {
      setColor('#14b8a6');
    }
  }, [clubInfo]);

  useEffect(() => {
    if (!clubSeleccionado) return;
    const fetchGraficos = async () => {
      try {
        const [pistasRes, horasRes, clientesRes, gananciasRes] = await Promise.all([
          fetch(`http://localhost:3000/api/reservas/mas-reservadas/${clubSeleccionado}`),
          fetch(`http://localhost:3000/api/reservas/horas-mas-reservadas/${clubSeleccionado}`),
          fetch(`http://localhost:3000/api/reservas/clientes-mas-reservas/${clubSeleccionado}`),
          fetch(`http://localhost:3000/api/reservas/ganancias/${clubSeleccionado}`),
        ]);
        const pistasData = await pistasRes.json();
        const horasData = await horasRes.json();
        const clientesData = await clientesRes.json();
        const gananciasData = await gananciasRes.json();

        setPistasMasReservadas({
          labels: pistasData.map(p => p.pista),
          datasets: [{
            label: 'Reservas',
            data: pistasData.map(p => p.reservas),
            backgroundColor: ['#14b8a6', '#0ea5e9', '#f59e42', '#f43f5e', '#6366f1'],
          }],
        });
        setHorasMasReservadas({
          labels: horasData.map(h => h.hora_inicio),
          datasets: [{
            label: 'Reservas',
            data: horasData.map(h => h.reservas),
            backgroundColor: '#0ea5e9',
          }],
        });
        setClientesMasReservas({
          labels: clientesData.map(c => c.cliente),
          datasets: [{
            label: 'Reservas',
            data: clientesData.map(c => c.reservas),
            backgroundColor: ['#f59e42', '#14b8a6', '#0ea5e9', '#f43f5e', '#6366f1'],
          }],
        });
        setGanancias({
          labels: gananciasData.map(g => g.mes),
          datasets: [{
            label: 'Ganancias (€)',
            data: gananciasData.map(g => g.ganancias),
            fill: false,
            borderColor: '#14b8a6',
            backgroundColor: '#14b8a6',
            tension: 0.3,
          }],
        });
      } catch {
        setPistasMasReservadas(null);
        setHorasMasReservadas(null);
        setClientesMasReservas(null);
        setGanancias(null);
      }
    };
    fetchGraficos();
  }, [clubSeleccionado]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div className="admin-view p-6 bg-gray-50 min-h-screen">
      <header className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white p-6 rounded-xl mb-8 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-6">
          <a href="/dashboard" className="hover:opacity-90 transition-opacity">
            <img src="/src/assets/logo_blanco.png" alt="Logo" className="w-20 h-20 object-contain" />
          </a>
          <h1 className="text-3xl font-bold cursor-pointer hover:text-indigo-100 transition-colors" onClick={() => navigate('/dashboard')}>
            MatchPointRS
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <UserMenu />
        </div>
      </header>

      {clubes.length > 1 && (
        <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-indigo-100">
          <label htmlFor="club-selector" className="block text-lg font-semibold mb-3 text-indigo-700">
            Selecciona el club a gestionar:
          </label>
          <select
            id="club-selector"
            value={clubSeleccionado}
            onChange={(e) => handleClubChange(e.target.value)}
            className="w-full p-3 border-2 border-indigo-200 rounded-lg shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 bg-indigo-50 text-indigo-700 font-medium"
          >
            {clubes.map((club) => (
              <option key={club.id_club} value={club.id_club}>
                {club.nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-indigo-100">
        <h3 className="text-2xl font-bold mb-4 text-indigo-700">Panel de Administración</h3>
        <p className="text-gray-600">Gestiona las pistas y personalización de tu club.</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Pistas */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-indigo-100 col-span-1">
          <h2 className="text-xl font-semibold text-indigo-700 mb-4">Pistas</h2>
          <ul className="mt-2 space-y-2">
            {pistas.map((pista) => (
              <li key={pista.id_pista} className="flex justify-between items-center py-3 px-4 bg-indigo-50 rounded-lg border border-indigo-100">
                <span className="font-medium text-indigo-700">{pista.nombre}</span>
                <div className="flex gap-2">
                  <button
                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 border border-indigo-300 rounded-lg shadow text-indigo-700 font-medium transition-all duration-150"
                    title="Editar pista"
                    onClick={() => handleEditPista(pista)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                    Editar
                  </button>
                  <button
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 border border-red-300 rounded-lg shadow text-red-700 font-medium transition-all duration-150"
                    title="Eliminar pista"
                    onClick={() => handleDeletePista(pista.id_pista)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                    Borrar
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <button
            className="mt-4 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-4 py-2 rounded-lg shadow-md hover:from-indigo-700 hover:to-indigo-600 transition-all duration-200 flex items-center gap-2"
            onClick={() => setShowForm(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nueva Pista
          </button>

          {showForm && (
            <form onSubmit={handleFormSubmit} className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
              <div className="mb-4">
                <label className="block text-indigo-700 font-medium mb-2">Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full p-2 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring focus:ring-indigo-200 bg-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-indigo-700 font-medium mb-2">Tipo</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full p-2 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring focus:ring-indigo-200 bg-white"
                  required
                >
                  <option value="">Seleccione un tipo</option>
                  <option value="Cubierta">Cubierta</option>
                  <option value="Exterior">Exterior</option>
                  <option value="Mixta">Mixta</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-indigo-700 font-medium mb-2">Precio por reserva</label>
                <input
                  type="number"
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                  className="w-full p-2 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring focus:ring-indigo-200 bg-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-indigo-700 font-medium mb-2">Duración (minutos)</label>
                <select
                  value={formData.duracion}
                  onChange={(e) => setFormData({ ...formData, duracion: e.target.value })}
                  className="w-full p-2 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring focus:ring-indigo-200 bg-white"
                  required
                >
                  <option value="">Seleccione la duración</option>
                  <option value="60">60 minutos</option>
                  <option value="90">90 minutos</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-4 py-2 rounded-lg shadow-md hover:from-indigo-700 hover:to-indigo-600 transition-all duration-200">
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-600 transition-all duration-200"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Personalización del Club */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-indigo-100 col-span-2">
          <h2 className="text-xl font-semibold text-indigo-700 mb-6">{clubInfo?.nombre || 'Personalización del Club'}</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-indigo-700 font-semibold mb-3">Logo del Club</label>
              <input
                type="file"
                className="mt-2 block w-full text-sm text-gray-500
                           file:mr-4 file:py-2 file:px-4
                           file:rounded-lg file:border-0
                           file:text-sm file:font-semibold
                           file:bg-indigo-50 file:text-indigo-700
                           hover:file:bg-indigo-100
                           file:transition-all file:duration-200"
                onChange={handleLogoUpload}
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="block text-indigo-700 font-semibold">Color Principal</label>
              <input
                type="color"
                className="w-16 h-8 border-2 border-indigo-200 rounded-lg cursor-pointer"
                value={color}
                onChange={handleColorChange}
              />
              <span className="text-gray-600">Elige el color de tu club</span>
            </div>
            <div>
              <label className="block text-indigo-700 font-semibold mb-3">URL de Google Maps</label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-indigo-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.5-7.5 11.25-7.5 11.25S4.5 18 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Pega aquí la URL de Google Maps"
                  className="pl-10 pr-4 py-2 w-full border-2 border-indigo-200 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 bg-indigo-50 text-gray-700 placeholder:text-indigo-400"
                  value={clubInfo?.url_maps || ''}
                  onChange={async (e) => {
                    const newUrlMaps = e.target.value;
                    setClubInfo((prev) => ({ ...prev, url_maps: newUrlMaps }));
                    if (clubInfo?.id_club) {
                      try {
                        const response = await fetch(`http://localhost:3000/api/clubs/${clubInfo.id_club}/url_maps`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ url_maps: newUrlMaps })
                        });
                        if (!response.ok) throw new Error('Error al actualizar la URL de Google Maps');
                      } catch {
                        alert('Error al actualizar la URL de Google Maps');
                      }
                    }
                  }}
                />
              </div>
              {clubInfo?.url_maps && (
                <a
                  href={clubInfo.url_maps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center mt-2 text-indigo-600 hover:text-indigo-800 text-sm underline transition-colors duration-150"
                >
                  Ver ubicación en Google Maps
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 7l-10 10M17 17V7H7" />
                  </svg>
                </a>
              )}
            </div>
            <div className="flex gap-4 mt-6">
              <button
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white px-5 py-3 rounded-xl shadow-md text-base font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                onClick={() => navigate(`/club-view/${clubInfo?.id_club}?color=${encodeURIComponent(color)}`)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Ver Vista de Usuario
              </button>
              <button
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-5 py-3 rounded-xl shadow-md text-base font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                onClick={() => navigate('/reservas')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                Ver Reservas
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center justify-center min-h-[260px] h-[260px] border border-indigo-100 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-bold mb-4 text-indigo-700 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
            Pistas más reservadas
          </h3>
          {pistasMasReservadas && pistasMasReservadas.labels.length > 0 ? (
            <div style={{ width: '100%', height: 180 }}>
              <Bar
                data={pistasMasReservadas}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: { enabled: true },
                    datalabels: { display: true }
                  },
                  scales: {
                    x: { display: true, title: { display: true, text: 'Pista', color: '#4f46e5', font: { weight: 'bold' } }, grid: { display: false } },
                    y: { display: true, title: { display: true, text: 'Reservas', color: '#4f46e5', font: { weight: 'bold' } }, beginAtZero: true, grid: { color: '#e0e7ff' } }
                  },
                  elements: { bar: { borderRadius: 12, borderSkipped: false } },
                }}
                height={180}
                width={260}
              />
            </div>
          ) : (
            <div className="text-gray-400 text-sm">Sin datos</div>
          )}
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center justify-center min-h-[260px] h-[260px] border border-indigo-100 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-bold mb-4 text-indigo-700 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Horas más reservadas
          </h3>
          {horasMasReservadas && horasMasReservadas.labels.length > 0 ? (
            <div style={{ width: '100%', height: 180 }}>
              <Bar
                data={horasMasReservadas}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: { enabled: true },
                  },
                  scales: {
                    x: { display: true, title: { display: true, text: 'Hora', color: '#4f46e5', font: { weight: 'bold' } }, grid: { display: false } },
                    y: { display: true, title: { display: true, text: 'Reservas', color: '#4f46e5', font: { weight: 'bold' } }, beginAtZero: true, grid: { color: '#e0e7ff' } }
                  },
                  elements: { bar: { borderRadius: 12, borderSkipped: false } },
                }}
                height={180}
                width={260}
              />
            </div>
          ) : (
            <div className="text-gray-400 text-sm">Sin datos</div>
          )}
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center justify-center min-h-[260px] h-[260px] border border-indigo-100 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-bold mb-4 text-indigo-700 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            Clientes con más reservas
          </h3>
          {clientesMasReservas && clientesMasReservas.labels.length > 0 ? (
            <div className="flex items-center justify-center w-[180px] h-[180px] mx-auto">
              <Pie
                data={clientesMasReservas}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: true, position: 'bottom', labels: { color: '#4f46e5', font: { size: 14 } } },
                    tooltip: { enabled: true },
                  },
                }}
                width={180}
                height={180}
              />
            </div>
          ) : (
            <div className="text-gray-400 text-sm">Sin datos</div>
          )}
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center justify-center min-h-[260px] h-[260px] border border-indigo-100 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-bold mb-4 text-indigo-700 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Ganancias
          </h3>
          {ganancias && ganancias.labels.length > 0 ? (
            <div style={{ width: '100%', height: 180 }}>
              <Line
                data={ganancias}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: { enabled: true },
                  },
                  scales: {
                    x: { display: true, title: { display: true, text: 'Mes', color: '#4f46e5', font: { weight: 'bold' } }, grid: { display: false } },
                    y: { display: true, title: { display: true, text: '€', color: '#4f46e5', font: { weight: 'bold' } }, beginAtZero: true, grid: { color: '#e0e7ff' } }
                  },
                  elements: { line: { borderWidth: 4, tension: 0.4 }, point: { radius: 4, backgroundColor: '#4f46e5' } },
                }}
                height={180}
                width={260}
              />
            </div>
          ) : (
            <div className="text-gray-400 text-sm">Sin datos</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminView;
