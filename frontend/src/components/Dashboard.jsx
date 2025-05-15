import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import UserMenu from './UserMenu';

function Dashboard() {
  const { user,login } = useAuth();
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

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
          <UserMenu />
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
            <div
              key={club.id_club}
              className="bg-white p-6 rounded-2xl shadow-lg flex flex-col gap-4 border-t-4"
              style={{ borderTopColor: '#14b8a6' }}
            >
              <div className="flex items-center gap-4 mb-2">
                <div>
                  <h4 className="text-xl font-bold text-gray-800 leading-tight">{club.nombre}</h4>
                  <p className="text-sm text-gray-500">{club.provincia}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-2">
                {club.url_maps && (
                  <a
                    href={club.url_maps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-600 hover:to-teal-500 text-white px-5 py-2 rounded-xl shadow-md text-base font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.5-7.5 11.25-7.5 11.25S4.5 18 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    Ver en Google Maps
                  </a>
                )}
                <button
                  onClick={() => handleViewClub(club.id_club)}
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-600 hover:to-teal-500 text-white px-5 py-2 rounded-xl shadow-md text-base font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 014-4h4" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 13l4-4m0 0l-4-4m4 4H7" />
                  </svg>
                  Ver Club
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;