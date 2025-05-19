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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white p-6 rounded-xl mb-8 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-6">
          <a href="/dashboard">
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

      <div className="bg-white p-8 rounded-xl shadow-lg border border-indigo-100">
        <h3 className="text-2xl font-bold mb-6 text-indigo-700 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          Reservas
        </h3>
        <div className="mb-6 flex gap-4">
          <div className="flex-1">
            <label className="block text-gray-700 font-medium mb-2">Fecha</label>
            <select 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring focus:ring-indigo-200 bg-indigo-50 text-gray-700 transition-all duration-200"
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
                className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring focus:ring-indigo-200 bg-indigo-50 text-gray-700 transition-all duration-200"
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

        <div className="space-y-4">
          {loading ? (
            <Spinner />
          ) : reservas.length > 0 ? (
            reservas.map((reserva) => {
              const club = clubs.find(c => c.nombre === reserva.club);
              return (
                <div key={reserva.id_reserva} className="bg-white p-6 rounded-xl border border-indigo-100 hover:shadow-lg transition-all duration-200">
                  <div className="flex flex-col gap-4">
                    <div className="bg-indigo-50 p-4 rounded-lg flex items-center gap-3">
                      {club && (
                        <div 
                          style={{ background: club.color }} 
                          className="w-10 h-10 rounded-lg shadow-sm border border-gray-200"
                          title={club.color}
                        ></div>
                      )}
                      <h4 className="text-xl font-bold text-indigo-700">{reserva.club}</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-500 mb-1">Pista</span>
                        <span className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-indigo-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                          </svg>
                          {reserva.pista}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-500 mb-1">Hora</span>
                        <span className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-indigo-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatearHora(reserva.hora_inicio)} - {formatearHora(reserva.hora_fin)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-500 mb-1">Usuario</span>
                        <span className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-indigo-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                          {reserva.usuario}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-500 mb-1">Precio</span>
                        <span className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-indigo-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {reserva.precio}€
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-indigo-300 mb-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              <p className="text-gray-500 text-lg">No hay reservas para esta fecha.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservasView;