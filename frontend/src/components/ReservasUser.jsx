import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserMenu from './UserMenu';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

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
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/reservas/cancelar/${id_reserva}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al cancelar la reserva');
      }

      // Forzar actualización de las reservas
      setLastUpdate(new Date().getTime());
      
      // Mostrar mensaje de éxito
      alert('Reserva cancelada con éxito');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cancelar la reserva');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="bg-teal-500 text-white p-4 rounded mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img 
            src="/src/assets/logo_blanco.png" 
            alt="Logo" 
            className="w-24 h-24 object-contain cursor-pointer"
            onClick={() => navigate('/dashboard')}
          />
          <h1 className="text-2xl font-bold cursor-pointer" onClick={() => navigate('/dashboard')}>
            MatchPointRS
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <UserMenu />
        </div>
      </header>

      <div className="bg-white p-6 rounded shadow-md mb-6">
        <h2 className="text-2xl font-bold mb-6">Mis Reservas</h2>
        
        <div className="mb-6">
          <select
            value={tipoReservas}
            onChange={(e) => setTipoReservas(e.target.value)}
            className="w-full md:w-auto p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="proximas">Reservas Próximas</option>
            <option value="anteriores">Reservas Anteriores</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          </div>
        ) : reservas.length > 0 ? (
          <div className="grid gap-6">
            {reservas.map((reserva) => (
              <div key={reserva.id_reserva} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-1">Club</span>
                    <span className="text-lg font-semibold text-gray-800">{reserva.club_nombre}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-1">Pista</span>
                    <span className="text-lg font-semibold text-gray-800">{reserva.pista_nombre}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-1">Fecha</span>
                    <span className="text-lg font-semibold text-gray-800">{formatearFecha(reserva.fecha)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 mb-1">Horario</span>
                    <span className="text-lg font-semibold text-gray-800">
                      {formatearHora(reserva.hora_inicio)} - {formatearHora(reserva.hora_fin)}
                    </span>
                  </div>
                </div>
                {tipoReservas === 'proximas' && (
                  <div className="mt-6 flex justify-end">
                    <button 
                      className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      onClick={() => handleCancelarReserva(reserva.id_reserva)}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancelar Reserva
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">
            No hay {tipoReservas === 'proximas' ? 'próximas' : 'anteriores'} reservas
          </p>
        )}
      </div>
    </div>
  );
};

export default ReservasUser;
