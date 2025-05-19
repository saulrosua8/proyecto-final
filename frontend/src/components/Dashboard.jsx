import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import UserMenu from './UserMenu';
import Spinner from './Spinner';

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
        <Spinner size="large" />
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
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white p-6 rounded-xl mb-8 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-6">
          <img src="/src/assets/logo_blanco.png" alt="Logo" className="w-20 h-20 object-contain" />
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

      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md border border-indigo-100">
          <h3 className="text-xl font-bold mb-4 text-indigo-700">Buscar Clubs de Pádel</h3>
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </span>
              <input
                type="text"
                name="query"
                placeholder="Buscar por nombre o ciudad..."
                value={search}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring focus:ring-indigo-200 bg-indigo-50 text-gray-700 placeholder:text-indigo-400 transition-all duration-200"
              />
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white px-6 py-2.5 rounded-lg shadow-md font-medium transition-all duration-200 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              Buscar
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-indigo-700 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
          </svg>
          Clubs de Pádel
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club) => (
            <div
              key={club.id_club}
              className="bg-white p-6 rounded-xl shadow-md flex flex-col gap-4 border border-indigo-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
              style={{ borderTop: `4px solid ${club.color || '#4f46e5'}` }}
            >
              <div className="flex items-center gap-4 mb-2">
                <div className="flex-1">
                  <h4 className="text-2xl font-bold text-indigo-700 leading-tight mb-2">{club.nombre}</h4>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {club.provincia}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 mt-2">
                {club.url_maps && (
                  <a
                    href={club.url_maps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white px-5 py-3 rounded-xl shadow-md text-base font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
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
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white px-5 py-3 rounded-xl shadow-md text-base font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
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