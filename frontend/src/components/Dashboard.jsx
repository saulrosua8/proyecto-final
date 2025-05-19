import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import UserMenu from './UserMenu';
import Spinner from './Spinner';

function Dashboard() {
  const { user, login } = useAuth();
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
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <header className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-500 text-white p-6 sm:p-8 rounded-2xl mb-6 sm:mb-10 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 shadow-xl transform hover:scale-[1.02] transition-all duration-300">
        <div className="flex items-center gap-4 sm:gap-6">
          <img 
            src="/src/assets/logo_blanco.png" 
            alt="Logo" 
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain cursor-pointer hover:opacity-80 transition-opacity transform hover:rotate-3 duration-300"
            onClick={() => navigate('/dashboard')}
          />
          <h1 className="text-3xl sm:text-4xl font-bold cursor-pointer hover:text-white/90 transition-colors tracking-tight" onClick={() => navigate('/dashboard')}>
            MatchPointRS
          </h1>
        </div>
        <div className="flex items-center">
          <UserMenu />
        </div>
      </header>

      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Barra de búsqueda */}
        <form onSubmit={handleSearch} className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100/50 backdrop-blur-xl hover:shadow-xl transition-all duration-300">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar clubs por nombre o ciudad..."
                value={search}
                onChange={handleSearchChange}
                className="w-full p-4 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all duration-200 text-lg placeholder:text-gray-400"
              />
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-indigo-600 to-purple-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-600 transition-all duration-300 flex items-center justify-center gap-3 shadow-md hover:shadow-xl transform hover:scale-[1.02]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              Buscar
            </button>
          </div>
        </form>

        {/* Panel de acciones */}
        {user && (user.rol === 'Administrador' || user.rol === 'Club') && (
          <div className="bg-gradient-to-br from-white to-indigo-50/50 p-6 rounded-2xl shadow-lg border border-indigo-100/50 backdrop-blur-xl">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-indigo-700 flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              Panel de Administración
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
              {user.rol === 'Administrador' && (
                <button
                  onClick={() => navigate('/master')}
                  className="flex-1 bg-gradient-to-br from-indigo-600 to-purple-500 text-white p-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-600 transition-all duration-300 flex items-center justify-center gap-3 shadow-md hover:shadow-xl transform hover:scale-[1.02]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                  </svg>
                  Gestión de Clubs
                </button>
              )}
              <button
                onClick={() => navigate('/admin')}
                className="flex-1 bg-gradient-to-br from-indigo-600 to-purple-500 text-white p-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-600 transition-all duration-300 flex items-center justify-center gap-3 shadow-md hover:shadow-xl transform hover:scale-[1.02]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                </svg>
                Panel de Control
              </button>
              <button
                onClick={() => navigate('/reservas')}
                className="flex-1 bg-gradient-to-br from-indigo-600 to-purple-500 text-white p-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-600 transition-all duration-300 flex items-center justify-center gap-3 shadow-md hover:shadow-xl transform hover:scale-[1.02]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                Gestión de Reservas
              </button>
            </div>
          </div>
        )}

        {/* Lista de clubs */}
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-indigo-700 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
            Clubs Disponibles
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {clubs.map((club) => (
              <div key={club.id_club} className="bg-gradient-to-br from-white to-indigo-50/30 rounded-2xl shadow-lg border border-indigo-100/50 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] backdrop-blur-xl">
                <div className="p-6">
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">{club.nombre}</h3>
                    <div className="space-y-3">
                      <p className="text-gray-600 flex items-center gap-2 hover:text-indigo-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.5-7.5 11.25-7.5 11.25S4.5 18 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        {club.provincia}
                      </p>
                      <p className="text-gray-600 flex items-center gap-2 hover:text-indigo-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {club.apertura} - {club.cierre}
                      </p>
                      <p className="text-gray-600 flex items-center gap-2 hover:text-indigo-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                        </svg>
                        {club.telefono}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-indigo-100 p-4 bg-white/50 backdrop-blur-xl">
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleViewClub(club.id_club)}
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-500 text-white px-4 py-3 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-600 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-xl transform hover:scale-[1.02]"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Ver Club
                    </button>
                    {club.url_maps && (
                      <a
                        href={club.url_maps}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-blue-600 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-xl transform hover:scale-[1.02]"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        Ver en Google Maps
                      </a>
                    )}
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

export default Dashboard;