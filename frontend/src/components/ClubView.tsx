import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import UserMenu from './UserMenu';

dayjs.extend(customParseFormat); // Extender dayjs para manejar formatos personalizados

interface Horario {
    id_horario: number;
    hora_inicio: string;
    hora_fin: string;
    precio: number;
    disponibilidad: 'disponible' | 'reservado';
    pista?: Pista;
}

interface SelectedHorario extends Horario {
    pista: Pista;
}

interface Pista {
    id_pista: number;
    nombre: string;
    tipo: string;
    duracion: string;
    horarios: Horario[];
}

interface ClubInfo {
    id_club: number;
    nombre: string;
    provincia: string;
    direccion: string;
    telefono: string;
    apertura: string;
    cierre: string;
    descripcion: string;
    logo?: string;
    color: string;
    url_maps?: string;
}

const ClubView = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { id_club } = useParams();
    const location = useLocation();
    const [clubInfo, setClubInfo] = useState<ClubInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [horarios, setHorarios] = useState<Pista[]>([]);
    const [selectedHorario, setSelectedHorario] = useState<SelectedHorario | null>(null);
    const [color, setColor] = useState<string>('#14b8a6');

    useEffect(() => {
        const fetchClubData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:3000/api/clubs/${id_club}`);
                if (!response.ok) {
                    throw new Error('Error al obtener los datos del club');
                }
                const data = await response.json();
                setClubInfo(data);
            } catch (error) {
                console.error('Error al cargar los datos del club:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id_club) {
            fetchClubData();
        }
    }, [id_club]);

    useEffect(() => {
        const fetchHorarios = async () => {
            try {
            
                const response = await fetch(`http://localhost:3000/api/horarios/${id_club}/${selectedDate}`);
              
                if (!response.ok) {
                    throw new Error('Error al obtener los horarios');
                }
                const data = await response.json();
              
                setHorarios(data);
            } catch (error) {
                console.error('❌ Error al cargar los horarios:', error);
            }
        };

        if (id_club && selectedDate) {
            fetchHorarios();
        }
    }, [id_club, selectedDate]);

    useEffect(() => {
        if (clubInfo?.color) {
            setColor(clubInfo.color);
        } else {
            setColor('#14b8a6');
        }
    }, [clubInfo]);

    // Aplica el color como variable CSS
    useEffect(() => {
        document.documentElement.style.setProperty('--club-main-color', color);
        return () => {
            document.documentElement.style.removeProperty('--club-main-color');
        };
    }, [color]);

    if (loading) {
        return <div>Cargando...</div>;
    }

    const logoUrl = clubInfo?.logo 
        ? `http://localhost:3000/api/clubs/${id_club}/logo` 
        : '/src/assets/logo.png';

    // Generar un array de los próximos 11 días
    const proximosDias = Array.from({ length: 11 }, (_, i) => {
        return dayjs().add(i, 'day').format('YYYY-MM-DD');
    });

    // Filtrar horarios disponibles antes de renderizarlos
    const horariosDisponibles = horarios.map((pista) => ({
        ...pista,
        horarios: pista.horarios.filter((horario) => horario.disponibilidad === 'disponible')
    }));

    const handleHorarioClick = (horario, pista) => {
        setSelectedHorario({ ...horario, pista });
    };

    const handleOutsideClick = (e) => {
        if (e.target.closest('.reserva-detalles')) return;
        setSelectedHorario(null);
    };    const handleReserva = async () => {
        if (!selectedHorario) return;

        const reservaData = {
            id_horario: selectedHorario.id_horario,
            id_usuario: user?.id, // Usar el ID del usuario autenticado
            precio: selectedHorario.precio,
            hora_inicio: selectedHorario.hora_inicio,
            hora_fin: selectedHorario.hora_fin
        };

        try {
            const response = await fetch('http://localhost:3000/api/reservas/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reservaData)
            });

            if (!response.ok) {
                throw new Error('Error al realizar la reserva');
            }

            const data = await response.json();
            alert(`¡Reserva confirmada!`);
            setSelectedHorario(null);

            // Recargar los horarios para reflejar el cambio
            const updatedHorariosResponse = await fetch(`http://localhost:3000/api/horarios/${id_club}/${selectedDate}`);
            if (!updatedHorariosResponse.ok) {
                throw new Error('Error al recargar los horarios');
            }
            const updatedHorarios = await updatedHorariosResponse.json();
            setHorarios(updatedHorarios);
        } catch (error) {
            console.error('Error al realizar la reserva:', error);
            alert('Error al realizar la reserva');
        }
    };

    return (
        <div className="admin-view p-4" onClick={handleOutsideClick}>
            {/* Header principal */}
            <header className="text-white p-4 rounded mb-6 flex justify-between items-center" style={{backgroundColor: color + 'cc'}}>
                <div className="flex items-center gap-4">
                    <a href="/dashboard">
                        <img src="/src/assets/logo_blanco.png" alt="Logo" className="w-24 h-24 object-contain" />
                    </a>
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

            {/* Contenido del club */}
            <div className="bg-white p-6 rounded shadow-md mb-6">
                <div className="flex items-center mb-4">
                    <img 
                        src={logoUrl}
                        alt="Club Logo" 
                        className="w-16 h-16 object-cover rounded-full mr-4"
                        onError={(e) => {
                            e.currentTarget.src = '/src/assets/logo.png';
                        }}
                    />
                    <div>
                        <h3 className="text-xl font-bold mb-2" style={{color: color}}>{clubInfo?.nombre || 'Nombre del Club'}</h3>
                        {clubInfo?.url_maps && (
                            <a
                                href={clubInfo.url_maps}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 mt-1 rounded-lg font-semibold shadow transition-all duration-200 text-sm"
                                style={{
                                    textDecoration: 'none',
                                    background: `linear-gradient(90deg, ${color}, ${color}CC 80%)`,
                                    color: '#fff',
                                    border: `2px solid ${color}`
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.5-7.5 11.25-7.5 11.25S4.5 18 4.5 10.5a7.5 7.5 0 1115 0z" />
                                </svg>
                                Ver ubicación en Google Maps
                            </a>
                        )}
                    </div>
                </div>
                <p className="text-gray-600 mb-4">
                    {clubInfo?.descripcion || 'Descripción del club no disponible.'}
                </p>

                {/* Selector de fecha */}
                <div className="mb-6">
                    <select 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2"
                        style={{borderColor: color, boxShadow: `0 0 0 2px ${color}55`}}
                    >
                        {proximosDias.map((fecha) => (
                            <option key={fecha} value={fecha}>
                                {dayjs(fecha).format('DD/MM/YYYY')}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Horarios por pista */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {horariosDisponibles.map((pista) => (
                        <div key={pista.id_pista} className="border rounded-lg p-4">
                            <h4 className="font-bold mb-2">{pista.nombre}</h4>
                            <p className="text-sm text-gray-600 mb-2">
                                Tipo: {pista.tipo} - Duración: {pista.duracion} min
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {pista.horarios.map((horario) => (
                                    <button
                                        key={horario.id_horario}
                                        className={`p-2 text-sm rounded`}
                                        style={{backgroundColor: color + '33', color: color, border: `2px solid ${color}` }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleHorarioClick(horario, pista);
                                        }}
                                    >
                                        {dayjs(horario.hora_inicio, 'HH:mm:ss').format('HH:mm')} - 
                                        {dayjs(horario.hora_fin, 'HH:mm:ss').format('HH:mm')}
                                        <br />
                                        {horario.precio}€
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {selectedHorario && (
                    <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t shadow-lg reserva-detalles flex justify-between items-center">
                        <div className="flex gap-8 items-center">
                            <p className="flex items-center"><strong>Pista:&nbsp;</strong> {selectedHorario.pista.nombre}</p>
                            <p className="flex items-center"><strong>Hora:&nbsp;</strong> {dayjs(selectedHorario.hora_inicio, 'HH:mm:ss').format('HH:mm')} - {dayjs(selectedHorario.hora_fin, 'HH:mm:ss').format('HH:mm')}</p>
                            <p className="flex items-center"><strong>Precio:&nbsp;</strong> {selectedHorario.precio}€</p>
                        </div>
                        <button
                            className="px-4 py-2 rounded hover:opacity-90"
                            style={{backgroundColor: color + 'cc', color: '#fff', border: `2px solid ${color}` }}
                            onClick={handleReserva}
                        >
                            Reservar Pista
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClubView;