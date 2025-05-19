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

  const fetchReservas = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/reservas/usuario/${user.id}`);
      if (!response.ok) {
        throw new Error('Error al obtener las reservas');
      }
      const data = await response.json();
    
      
      if (!data || (!data.proximas && !data.anteriores)) {
        console.error('Formato de datos inesperado:', data);
        throw new Error('Formato de datos inválido');
      }
      
      const reservasFiltradas = tipoReservas === 'proximas' ? data.proximas : data.anteriores;

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
    const promesaCancelacion = fetch(`http://localhost:3000/api/reservas/cancelar/${id_reserva}`, {
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white p-6 rounded-xl mb-8 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-6">
          <img 
            src="/src/assets/logo_blanco.png" 
            alt="Logo" 
            className="w-20 h-20 object-contain cursor-pointer"
            onClick={() => navigate('/dashboard')}
          />
          <h1 className="text-3xl font-bold cursor-pointer hover:text-indigo-100 transition-colors" onClick={() => navigate('/dashboard')}>
            MatchPointRS
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <UserMenu />
        </div>
      </header>

      <div className="bg-white p-8 rounded-xl shadow-lg border border-indigo-100">
        <h2 className="text-2xl font-bold mb-6 text-indigo-700 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          Mis Reservas
        </h2>
        
        <div className="mb-6">
          <select
            value={tipoReservas}
            onChange={(e) => setTipoReservas(e.target.value)}
            className="w-full md:w-auto p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring focus:ring-indigo-200 bg-indigo-50 text-gray-700 transition-all duration-200"
          >
            <option value="proximas">Reservas Próximas</option>
            <option value="anteriores">Reservas Anteriores</option>
          </select>
        </div>

        {loading ? (
          <div className="py-8">
            <Spinner />
          </div>
        ) : reservas.length > 0 ? (
          <div className="space-y-6">
            {reservas.map((reserva) => (
              <div key={reserva.id_reserva} className="bg-white p-6 rounded-xl border border-indigo-100 hover:shadow-lg transition-all duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-1">Club</span>
                    <span className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-indigo-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                      </svg>
                      {reserva.club_nombre}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-1">Pista</span>
                    <span className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-indigo-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.5-7.5 11.25-7.5 11.25S4.5 18 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      {reserva.pista_nombre}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-1">Fecha</span>
                    <span className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-indigo-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                      {formatearFecha(reserva.fecha)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-1">Horario</span>
                    <span className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-indigo-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatearHora(reserva.hora_inicio)} - {formatearHora(reserva.hora_fin)}
                    </span>
                  </div>
                </div>
                {tipoReservas === 'proximas' && (
                  <div className="mt-6 flex justify-end">
                    <button 
                      onClick={() => handleCancelarReserva(reserva.id_reserva)}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:from-red-700 hover:to-red-600 transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
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
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-indigo-300 mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <p className="text-gray-500 text-lg">
              No hay {tipoReservas === 'proximas' ? 'próximas' : 'anteriores'} reservas
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservasUser;
