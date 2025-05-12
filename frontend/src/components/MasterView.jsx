import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function MasterView() {
  const [clubs, setClubs] = useState([]);
  const [form, setForm] = useState({
    id_club: null,
    nombre: '',
    provincia: '',
    direccion: '',
    telefono: '',
    apertura: '08:00',
    cierre: '22:00',
    descripcion: '',
  });
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    fetch('http://localhost:3000/api/clubs')
      .then((response) => response.json())
      .then((data) => setClubs(data))
      .catch((error) => console.error('Error al cargar los clubes:', error));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.id_club) {
        // Editar club existente
        fetch(`http://localhost:3000/api/clubs/${form.id_club}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Error al actualizar el club');
                }
                return response.json();
            })
            .then(() => {
                alert('Club actualizado exitosamente');
                setClubs(clubs.map((club) => (club.id_club === form.id_club ? form : club)));
                setForm({
                    id_club: null,
                    nombre: '',
                    provincia: '',
                    direccion: '',
                    telefono: '',
                    apertura: '08:00',
                    cierre: '22:00',
                    descripcion: '',
                });
            })
            .catch((error) => alert(error.message));
    } else {
        // Crear nuevo club
        fetch('http://localhost:3000/api/clubs/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...form, id_usuario: 1 }), // ID de usuario administrador
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Error al crear el club');
                }
                return response.json();
            })
            .then((data) => {
                alert('Club creado exitosamente');
                setClubs([...clubs, { ...form, id_club: data.id }]);
                setForm({
                    id_club: null,
                    nombre: '',
                    provincia: '',
                    direccion: '',
                    telefono: '',
                    apertura: '08:00',
                    cierre: '22:00',
                    descripcion: '',
                });
            })
            .catch((error) => alert(error.message));
    }
};

  const handleDeleteClub = (id_club) => {
    if (window.confirm('¿Estás seguro de que deseas borrar este club?')) {
        fetch(`http://localhost:3000/api/clubs/${id_club}`, {
            method: 'DELETE',
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Error al borrar el club');
                }
                setClubs(clubs.filter((club) => club.id_club !== id_club));
                alert('Club borrado exitosamente');
            })
            .catch((error) => alert(error.message));
    }
};

const handleEditClub = (id_club) => {
    const clubToEdit = clubs.find((club) => club.id_club === id_club);
    if (clubToEdit) {
        setForm({ ...clubToEdit });
    }
};

  return (
    <div className="p-4">
      <header className="bg-teal-500 text-white p-4 rounded mb-6 flex justify-between items-center">
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
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="bg-teal-700 text-white px-4 py-2 rounded hover:bg-teal-800"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded shadow-md">
          <h2 className="text-xl font-bold mb-4">Crear Nuevo Club</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="nombre"
              placeholder="Nombre"
              value={form.nombre}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="text"
              name="provincia"
              placeholder="Ciudad"
              value={form.provincia}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="text"
              name="direccion"
              placeholder="Dirección"
              value={form.direccion}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="text"
              name="telefono"
              placeholder="Teléfono"
              value={form.telefono}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
            <div className="flex gap-4">
              <input
                type="time"
                name="apertura"
                value={form.apertura}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="time"
                name="cierre"
                value={form.cierre}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <textarea
              name="descripcion"
              placeholder="Descripción"
              value={form.descripcion}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            ></textarea>
            <button
              type="submit"
              className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
            >
              Guardar
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded shadow-md">
          <h2 className="text-xl font-bold mb-4">Lista de Clubs</h2>
          <div className="overflow-y-auto max-h-96">
            {clubs.map((club) => (
              <div key={club.id_club} className="border-b py-4 flex items-center gap-4">
                
                <div>
                  <h3 className="font-bold text-lg">{club.nombre}</h3>
                  <p className="text-sm text-gray-600">{club.provincia}</p>
                </div>
                <div className="ml-auto flex gap-2">
                  <button
                    onClick={() => handleEditClub(club.id_club)}
                    className="bg-teal-500 text-white px-2 py-1 rounded hover:bg-teal-600"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteClub(club.id_club)}
                    className="bg-teal-700 text-white px-2 py-1 rounded hover:bg-teal-800"
                  >
                    Borrar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MasterView;