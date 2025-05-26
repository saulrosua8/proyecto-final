import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useAuth } from '../context/AuthContext';
import UserMenu from './UserMenu';
import Spinner from './Spinner';

// Extender dayjs para manejar formatos personalizados
dayjs.extend(customParseFormat);

const ReservasView = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [reservas, setReservas] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserClubs = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      try {
        const response = await fetch('http://localhost:3000/api/clubs/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id_usuario: user.id })
        });
        
        if (!response.ok) {
          throw new Error('Error al obtener los clubes');
        }
        
        const data = await response.json();

        const clubsArray = Array.isArray(data) ? data : [data];
        setClubs(clubsArray);
        
        if (clubsArray.length > 0) {
          setSelectedClub(clubsArray[0].id_club);
        }
      } catch (error) {
        console.error('Error al cargar los clubes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserClubs();
  }, [user]);

  useEffect(() => {
    const fetchReservas = async () => {
      if (!selectedClub) return;
      
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3000/api/reservas/${selectedDate}?id_club=${selectedClub}`);
        if (!response.ok) {
          throw new Error('Error al obtener las reservas');
        }
        const data = await response.json();
        setReservas(data);
      } catch (error) {
        console.error('Error al cargar las reservas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservas();
  }, [selectedDate, selectedClub]);

  // Función para formatear la hora correctamente
  const formatearHora = (hora) => {
    if (!hora) return '';
    return dayjs(hora, 'HH:mm:ss').format('HH:mm');
  };

  // Generar array de próximos días
  const proximosDias = Array.from({ length: 11 }, (_, i) => {
    return dayjs().add(i, 'day').format('YYYY-MM-DD');
  });

  if (loading) {
    return <div className="flex justify-center items-center min-h-[200px]"><Spinner /></div>;
  }

  if (!user) {
    return <div className="flex justify-center items-center min-h-[200px]"><Spinner /></div>;
  }

  if (!reservas || reservas.length === 0) {
    return <div className="flex justify-center items-center min-h-[200px]"><Spinner /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <header className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-500 text-white p-4 sm:p-6 rounded-xl mb-4 sm:mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 shadow-lg transform hover:scale-[1.02] transition-all duration-300">
        <div className="flex items-center gap-4 sm:gap-6">
          <a href="/dashboard">
            <img src="/src/assets/logo_blanco.png" alt="Logo" className="w-16 h-16 sm:w-20 sm:h-20 object-contain" />
          </a>
          <h1 className="text-2xl sm:text-3xl font-bold cursor-pointer hover:text-indigo-100 transition-colors" onClick={() => navigate('/dashboard')}>
            MatchPointRS
          </h1>
        </div>
        <div className="flex items-center">
          <UserMenu />
        </div>
      </header>

      <div className="max-w-7xl mx-auto">
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-indigo-100 mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-indigo-700 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            Gestión de Reservas
          </h2>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <label className="block text-gray-700 font-medium mb-2">Fecha</label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-2 sm:p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring focus:ring-indigo-200 bg-indigo-50 text-gray-700 transition-all duration-200"
              >
                {proximosDias.map((fecha) => (
                  <option key={fecha} value={fecha}>
                    {dayjs(fecha).format('DD/MM/YYYY')}
                  </option>
                ))}
              </select>
            </div>

            {clubs.length > 1 && (
              <div className="flex-1">
                <label className="block text-gray-700 font-medium mb-2">Club</label>
                <select
                  value={selectedClub || ''}
                  onChange={(e) => setSelectedClub(e.target.value)}
                  className="w-full p-2 sm:p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring focus:ring-indigo-200 bg-indigo-50 text-gray-700 transition-all duration-200"
                >
                  {clubs.map((club) => (
                    <option key={club.id_club} value={club.id_club}>
                      {club.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-indigo-100">
          {loading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <Spinner />
            </div>
          ) : reservas.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {reservas.map((reserva) => (
                <div key={reserva.id_reserva} className="bg-white p-4 sm:p-6 rounded-xl border border-indigo-100 hover:shadow-lg transition-all duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-500 mb-1">Pista</span>
                      <span className="text-base sm:text-lg font-semibold text-gray-800">{reserva.pista}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-500 mb-1">Usuario</span>
                      <span className="text-base sm:text-lg font-semibold text-gray-800">{reserva.usuario}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-500 mb-1">Horario</span>
                      <span className="text-base sm:text-lg font-semibold text-gray-800">
                        {formatearHora(reserva.hora_inicio)} - {formatearHora(reserva.hora_fin)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-500 mb-1">Precio</span>
                      <span className="text-base sm:text-lg font-semibold text-gray-800">{reserva.precio}€</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 text-lg">No hay reservas para esta fecha</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservasView;