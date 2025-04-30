import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';

const ClubView = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id_club } = useParams();
    const [clubInfo, setClubInfo] = useState(null);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return <div>Cargando...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header principal */}
            <header className="bg-teal-500 text-white p-4 rounded mb-6 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <a href="/dashboard">
                        <img src="/src/assets/logo_blanco.png" alt="Logo" className="w-24 h-24 object-contain" />
                    </a>
                    <h1 className="text-2xl font-bold cursor-pointer" onClick={() => navigate('/dashboard')}>
                        MatchPointRS
                    </h1>
                </div>
            </header>

            {/* Contenido del club */}
            <div className="container mx-auto mt-8 p-4 bg-white shadow-md rounded-md">
                <div className="flex items-center mb-4">
                    {/* Imagen del club */}
                    <img 
                        src={clubInfo?.logo || '/path-to-default-image.jpg'} 
                        alt="Club Logo" 
                        className="w-16 h-16 object-cover rounded-full mr-4"
                    />
                    {/* Nombre del club */}
                    <h1 className="text-2xl font-bold text-gray-800">{clubInfo?.nombre || 'Nombre del Club'}</h1>
                </div>

                {/* Descripción */}
                <p className="text-gray-600">
                    {clubInfo?.descripcion || 'Descripción del club no disponible.'}
                </p>
            </div>
        </div>
    );
};

export default ClubView;