import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Dashboard() {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fetchClubs = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/clubs`);
      if (!response.ok) {
        throw new Error('Error al obtener los clubes');
      }
      const data = await response.json();
      setClubs(data);
    } catch (error) {
      console.error('Error fetching clubs:', error);
    }
  };

  const searchClubs = async (query) => {
    try {
      const response = await fetch(`http://localhost:3000/api/clubs/search?query=${query}`);
      if (!response.ok) {
        throw new Error('Error al buscar los clubes');
      }
      const data = await response.json();
      setClubs(data);
    } catch (error) {
      console.error('Error searching clubs:', error);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim() === '') {
      fetchClubs();
    } else {
      searchClubs(search);
    }
  };

  const handleViewClub = (id_club) => {
    navigate(`/club-view/${id_club}`);
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  useEffect(() => {
    if (!user) {
      const token = localStorage.getItem('token');
      if (token) {
        fetch('http://localhost:3000/api/validate-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error('Token inválido');
            }
            return response.json();
          })
          .then((data) => {
            if (data.user) {
              login(data.user, token);
            } else {
              throw new Error('Usuario no encontrado');
            }
          })
          .catch(() => {
            localStorage.removeItem('token');
            navigate('/login');
          })
          .finally(() => setLoading(false));
      } else {
        navigate('/login');
      }
    } else {
      setLoading(false);
    }
  }, [user, login, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
          <span className="visually-hidden"></span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">
          No estás autenticado.{' '}
          <Link to="/login" className="text-blue-500 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="bg-teal-500 text-white p-4 rounded mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img src="/src/assets/logo_blanco.png" alt="Logo" className="w-24 h-24 object-contain" />
          <h1
            className="text-2xl font-bold cursor-pointer"
            onClick={() => navigate('/dashboard')}
          >
            MatchPointRS
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {user.rol === 'Administrador' && (
            <button
              onClick={() => navigate('/master')}
              className="bg-teal-700 text-white px-4 py-2 rounded hover:bg-teal-800"
            >
              Panel Master
            </button>
          )}
          {['Administrador', 'Club'].includes(user.rol) && (
            <button
              onClick={() => navigate('/admin')}
              className="bg-teal-700 text-white px-4 py-2 rounded hover:bg-teal-800"
            >
              Panel Admin
            </button>
          )}
          <button
            onClick={handleLogout}
            className="bg-teal-700 text-white px-4 py-2 rounded hover:bg-teal-800"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <div className="bg-white p-6 rounded shadow-md mb-6">
        <h3 className="text-xl font-bold mb-4">Buscar Clubs de Pádel</h3>
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            name="query"
            placeholder="Buscar por nombre o ciudad..."
            value={search}
            onChange={handleSearchChange}
            className="border p-2 rounded w-full"
          />
          <button
            type="submit"
            className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
          >
            Buscar
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Clubs de Pádel</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club) => (
            <div key={club.id_club} className="bg-white p-4 rounded shadow-md">
              <h4 className="text-lg font-bold mb-2">{club.nombre}</h4>
              <p className="text-gray-600 mb-2">{club.provincia}</p>
              <p className="text-gray-600 mb-4">{club.descripcion}</p>
              <button
                onClick={() => handleViewClub(club.id_club)}
                className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
              >
                Ver Club
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;