import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserMenu from './UserMenu';
import Spinner from './Spinner';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import toast from 'react-hot-toast';

dayjs.extend(customParseFormat);

const ReservasUser = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tipoReservas, setTipoReservas] = useState('proximas');
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date().getTime());
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchReservas = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/reservas/usuario/${user.id}`);
      if (!response.ok) {
        throw new Error('Error al obtener las reservas');
      }
      const data = await response.json();
      console.log('Respuesta del endpoint de reservas:', data); // <-- Añadido para depuración
      
      if (!data || (!data.proximas && !data.anteriores)) {
        console.error('Formato de datos inesperado:', data);
        throw new Error('Formato de datos inválido');
      }
      
      let reservasFiltradas = tipoReservas === 'proximas' ? data.proximas : data.anteriores;
      if (tipoReservas === 'proximas') {
        const now = dayjs();
        reservasFiltradas = reservasFiltradas.filter(r => {
          // Combina fecha y hora_inicio para comparar con el momento actual
          const fechaHora = dayjs(`${r.fecha} ${r.hora_inicio}`, 'YYYY-MM-DD HH:mm:ss');
          return fechaHora.isAfter(now);
        });
      }
      setReservas(reservasFiltradas || []);
    } catch (error) {
      console.error('Error al cargar las reservas:', error);
      setReservas([]);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar las reservas al montar el componente y cuando cambien las dependencias
  useEffect(() => {
    fetchReservas();
  }, [user, tipoReservas, lastUpdate]);

  const formatearFecha = (fecha) => {
    return dayjs(fecha).format('DD/MM/YYYY');
  };

  const formatearHora = (hora) => {
    return dayjs(hora, 'HH:mm:ss').format('HH:mm');
  };

  const handleCancelarReserva = async (id_reserva) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="font-semibold text-gray-800">¿Estás seguro de que deseas cancelar esta reserva?</p>
        <div className="flex justify-end gap-2">
          <button
            className="px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancelar
          </button>
          <button
            className="px-3 py-1 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
            onClick={() => {
              toast.dismiss(t.id);
              realizarCancelacion(id_reserva);
            }}
          >
            Confirmar
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

  const realizarCancelacion = async (id_reserva) => {
    const promesaCancelacion = fetch(`${apiUrl}/api/reservas/cancelar/${id_reserva}`, {
      method: 'DELETE',
    });

    toast.promise(promesaCancelacion, {
      loading: 'Cancelando reserva...',
      success: () => {
        setLastUpdate(new Date().getTime());
        return '¡Reserva cancelada con éxito!';
      },
      error: 'Error al cancelar la reserva',
    });
  };

  // if (loading) {
  //   return <div className="flex justify-center items-center min-h-[200px]"><Spinner /></div>;
  // }

  if (!user) {
    return <div className="flex justify-center items-center min-h-[200px]"><Spinner /></div>;
  }

  // Mostrar mensaje amigable si no hay reservas, pero renderizando el layout normal
  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <header className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-500 text-white p-4 sm:p-6 rounded-xl mb-4 sm:mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 shadow-lg transform hover:scale-[1.02] transition-all duration-300">
        <div className="flex items-center gap-4 sm:gap-6">
          <img 
            src="/src/assets/logo_blanco.png" 
            alt="Logo" 
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain cursor-pointer"
            onClick={() => navigate('/dashboard')}
          />
          <h1 className="text-2xl sm:text-3xl font-bold cursor-pointer hover:text-indigo-100 transition-colors" onClick={() => navigate('/dashboard')}>
            MatchPointRS
          </h1>
        </div>
        <div className="flex items-center">
          <UserMenu />
        </div>
      </header>

      <div className="bg-white p-4 sm:p-8 rounded-xl shadow-lg border border-indigo-100">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-indigo-700 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          Mis Reservas
        </h2>
        <div className="mb-4 sm:mb-6">
          <select
            value={tipoReservas}
            onChange={(e) => setTipoReservas(e.target.value)}
            className="w-full sm:w-auto p-2 sm:p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring focus:ring-indigo-200 bg-indigo-50 text-gray-700 transition-all duration-200"
          >
            <option value="proximas">Reservas Próximas</option>
            <option value="anteriores">Reservas Anteriores</option>
          </select>
        </div>
        {reservas && reservas.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {reservas.map((reserva) => (
              <div key={reserva.id_reserva} className="bg-white p-4 sm:p-6 rounded-xl border border-indigo-100 hover:shadow-lg transition-all duration-200 relative overflow-hidden">
                {/* Fondo del logo del club */}
                {reserva.id_club && (
                  <img
                    src={`/logo_blanco.png`}
                    alt="Logo Club"
                    className="absolute inset-0 w-full h-full object-contain opacity-10 pointer-events-none select-none"
                    style={{ zIndex: 0 }}
                    onError={e => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 relative z-10">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-1">Club</span>
                    <span className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                      </svg>
                      {reserva.club_nombre}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-1">Pista</span>
                    <span className="text-base sm:text-lg font-semibold text-gray-800">{reserva.pista_nombre}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-1">Fecha y Hora</span>
                    <span className="text-base sm:text-lg font-semibold text-gray-800">
                      {dayjs(reserva.fecha).format('DD/MM/YYYY')} {dayjs(reserva.hora_inicio, 'HH:mm:ss').format('HH:mm')} - {dayjs(reserva.hora_fin, 'HH:mm:ss').format('HH:mm')}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-1">Precio</span>
                    <span className="text-base sm:text-lg font-semibold text-gray-800">{reserva.precio}€</span>
                  </div>
                </div>

                {tipoReservas === 'proximas' && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleCancelarReserva(reserva.id_reserva)}
                      className="bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-red-700 hover:to-red-600 transition-all duration-200 flex items-center gap-2 text-sm sm:text-base"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancelar Reserva
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 text-lg">No tienes reservas {tipoReservas === 'proximas' ? 'próximas' : 'anteriores'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservasUser;
