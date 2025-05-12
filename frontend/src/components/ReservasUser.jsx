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

  useEffect(() => {
    const fetchReservas = async () => {
      if (!user?.id) return;

      setLoading(true);      try {
        const response = await fetch(`http://localhost:3000/api/reservas/usuario/${user.id}`);
        if (!response.ok) {
          throw new Error('Error al obtener las reservas');
        }
        const data = await response.json();
        console.log('Datos recibidos:', data); // Para depuración
        
        if (!data || (!data.proximas && !data.anteriores)) {
          console.error('Formato de datos inesperado:', data);
          throw new Error('Formato de datos inválido');
        }
        
        // Usamos el tipo seleccionado para mostrar las reservas correspondientes
        const reservasFiltradas = tipoReservas === 'proximas' ? data.proximas : data.anteriores;
        console.log(`Reservas ${tipoReservas}:`, reservasFiltradas);
        setReservas(reservasFiltradas || []);
      } catch (error) {
        console.error('Error al cargar las reservas:', error);
        setReservas([]); // Aseguramos que siempre tengamos un array
      } finally {
        setLoading(false);
      }
    };

    fetchReservas();
  }, [user, tipoReservas]);
  const formatearFecha = (fecha) => {
    // La fecha viene en formato ISO, necesitamos convertirla
    return dayjs(fecha).format('DD/MM/YYYY');
  };
  const formatearHora = (hora) => {
    // La hora viene en formato HH:mm:ss
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

      // Actualizar la lista de reservas después de cancelar
      const updatedResponse = await fetch(`http://localhost:3000/api/reservas/usuario/${user.id}`);
      if (!updatedResponse.ok) {
        throw new Error('Error al actualizar las reservas');
      }

      const data = await updatedResponse.json();
      const reservasFiltradas = tipoReservas === 'proximas' ? data.proximas : data.anteriores;
      setReservas(reservasFiltradas || []);

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
          <div className="grid gap-4">
            {reservas.map((reserva) => (              <div key={reserva.id_reserva} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>                    <p className="font-semibold">Club</p>
                    <p>{reserva.club_nombre}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Pista</p>
                    <p>{reserva.pista_nombre}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Fecha</p>
                    <p>{formatearFecha(reserva.fecha)}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Horario</p>
                    <p>{formatearHora(reserva.hora_inicio)} - {formatearHora(reserva.hora_fin)}</p>
                  </div>
                </div>                {tipoReservas === 'proximas' && (
                  <button 
                    className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                    onClick={() => handleCancelarReserva(reserva.id_reserva)}
                  >
                    Cancelar Reserva
                  </button>
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
