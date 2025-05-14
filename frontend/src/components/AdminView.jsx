import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import UserMenu from './UserMenu';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
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
          <UserMenu />
        </div>
      </header>

      {clubes.length > 1 && (
        <div className="bg-white p-6 rounded shadow-md mb-6">
          <label htmlFor="club-selector" className="block text-lg font-semibold mb-2">
            Selecciona el club a gestionar:
          </label>
          <select
            id="club-selector"
            value={clubSeleccionado}
            onChange={(e) => handleClubChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200"
          >
            {clubes.map((club) => (
              <option key={club.id_club} value={club.id_club}>
                {club.nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="bg-white p-6 rounded shadow-md mb-6">
        <h3 className="text-xl font-bold mb-4">Panel de Administración</h3>
        <p className="text-gray-600">Gestiona las pistas y personalización de tu club.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
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
                    
                  </button>
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDeletePista(pista.id_pista)}
                  >
                    
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
              <div className="mb-2">
                <label className="block text-gray-700">Duración (minutos)</label>
                <select
                  value={formData.duracion}
                  onChange={(e) => setFormData({ ...formData, duracion: e.target.value })}
                  className="w-full border rounded px-2 py-1"
                  required
                >
                  <option value="">Seleccione la duración</option>
                  <option value="60">60 minutos</option>
                  <option value="90">90 minutos</option>
                </select>
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
          <button
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => navigate('/reservas')}
          >
            Ver Reservas
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 items-stretch">
        <div className="bg-white p-4 rounded-2xl shadow flex flex-col items-center justify-center min-h-[260px] h-[260px] border border-teal-100 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-bold mb-4 text-teal-700 flex items-center gap-2">
          
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
                    x: { display: true, title: { display: true, text: 'Pista', color: '#0f766e', font: { weight: 'bold' } }, grid: { display: false } },
                    y: { display: true, title: { display: true, text: 'Reservas', color: '#0f766e', font: { weight: 'bold' } }, beginAtZero: true, grid: { color: '#e0f2f1' } }
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
        <div className="bg-white p-4 rounded-2xl shadow flex flex-col items-center justify-center min-h-[260px] h-[260px] border border-teal-100 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-bold mb-4 text-teal-700 flex items-center gap-2">
            
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
                    x: { display: true, title: { display: true, text: 'Hora', color: '#0ea5e9', font: { weight: 'bold' } }, grid: { display: false } },
                    y: { display: true, title: { display: true, text: 'Reservas', color: '#0ea5e9', font: { weight: 'bold' } }, beginAtZero: true, grid: { color: '#e0f2f1' } }
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
        <div className="bg-white p-4 rounded-2xl shadow flex flex-col items-center justify-center min-h-[260px] h-[260px] border border-teal-100 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-bold mb-4 text-teal-700 flex items-center gap-2">
            
            Clientes con más reservas
          </h3>
          {clientesMasReservas && clientesMasReservas.labels.length > 0 ? (
            <div className="flex items-center justify-center w-[180px] h-[180px] mx-auto" style={{ width: 180, height: 180 }}>
              <Pie
                data={clientesMasReservas}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: true, position: 'bottom', labels: { color: '#0f172a', font: { size: 14 } } },
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
        <div className="bg-white p-4 rounded-2xl shadow flex flex-col items-center justify-center min-h-[260px] h-[260px] border border-teal-100 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-bold mb-4 text-teal-700 flex items-center gap-2">
           
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
                    x: { display: true, title: { display: true, text: 'Mes', color: '#14b8a6', font: { weight: 'bold' } }, grid: { display: false } },
                    y: { display: true, title: { display: true, text: '€', color: '#14b8a6', font: { weight: 'bold' } }, beginAtZero: true, grid: { color: '#e0f2f1' } }
                  },
                  elements: { line: { borderWidth: 4, tension: 0.4 }, point: { radius: 4, backgroundColor: '#14b8a6' } },
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
