import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useAuth } from '../context/AuthContext';
import UserMenu from './UserMenu';

// Extender dayjs para manejar formatos personalizados
dayjs.extend(customParseFormat);

const ReservasView = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [reservas, setReservas] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);

  useEffect(() => {
    const fetchUserClubs = async () => {
      if (!user?.id) return;
      
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
        console.log('Clubes obtenidos:', data); // Debug log
        const clubsArray = Array.isArray(data) ? data : [data];
        setClubs(clubsArray);
        
        if (clubsArray.length > 0) {
          setSelectedClub(clubsArray[0].id_club);
        }
      } catch (error) {
        console.error('Error al cargar los clubes:', error);
      }
    };

    fetchUserClubs();
  }, [user]);

  useEffect(() => {
    const fetchReservas = async () => {
      if (!selectedClub) return;
      
      try {
        const response = await fetch(`http://localhost:3000/api/reservas/${selectedDate}?id_club=${selectedClub}`);
        if (!response.ok) {
          throw new Error('Error al obtener las reservas');
        }
        const data = await response.json();
        setReservas(data);
      } catch (error) {
        console.error('Error al cargar las reservas:', error);
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
    <div className="reservas-view p-4">
      <header className="bg-teal-500 text-white p-4 rounded mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <a href="/dashboard">
            <img src="/src/assets/logo_blanco.png" alt="Logo" className="w-24 h-24 object-contain" />
          </a>
          <h1 className="text-2xl font-bold cursor-pointer" onClick={() => navigate('/dashboard')}>
            MatchPointRS
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <UserMenu />
        </div>
      </header>

      <div className="bg-white p-6 rounded shadow-md mb-6">
        <h3 className="text-xl font-bold mb-4">Reservas</h3>
        <div className="mb-6 flex gap-4">
          <select 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {proximosDias.map((fecha) => (
              <option key={fecha} value={fecha}>
                {dayjs(fecha).format('DD/MM/YYYY')}
              </option>
            ))}
          </select>

          {clubs.length > 1 && (
            <select
              value={selectedClub || ''}
              onChange={(e) => setSelectedClub(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {clubs.map((club) => (
                <option key={club.id_club} value={club.id_club} style={{ color: club.color }}>
                  {club.nombre}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4">
          {reservas.length > 0 ? (
            reservas.map((reserva) => {
              const club = clubs.find(c => c.nombre === reserva.club);
              return (
                <div key={reserva.id_reserva} className="border rounded-lg p-4">
                  <div className="flex flex-col gap-2">
                    <div className="bg-teal-50 p-3 rounded-lg flex items-center gap-2">
                      {club && (
                        <span style={{ width: 18, height: 18, background: club.color, borderRadius: '50%', border: '1px solid #ccc', display: 'inline-block' }} title={club.color}></span>
                      )}
                      <h4 className="font-bold text-teal-800">{reserva.club}</h4>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                      <p><strong>Pista:</strong> {reserva.pista}</p>
                      <p><strong>Hora:</strong> {formatearHora(reserva.hora_inicio)} - {formatearHora(reserva.hora_fin)}</p>
                      <p><strong>Usuario:</strong> {reserva.usuario}</p>
                      <p><strong>Precio:</strong> {reserva.precio}€</p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500">No hay reservas para esta fecha.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservasView;