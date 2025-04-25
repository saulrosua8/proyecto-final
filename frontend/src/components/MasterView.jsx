import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function MasterView() {
  const [clubs, setClubs] = useState([]);
  const [form, setForm] = useState({
    nombre: '',
    provincia: '',
    direccion: '',
    telefono: '',
    apertura: '08:00',
    cierre: '22:00',
    descripcion: '',
  });
  const navigate = useNavigate();

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
  };

  return (
    <div className="p-4">
      <header className="bg-teal-500 text-white p-4 rounded mb-6 flex justify-between items-center">
        <h1
          className="text-2xl font-bold cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          MatchPointRS
        </h1>
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
                <div className="flex-shrink-0 w-12 h-12 bg-teal-500 text-white flex items-center justify-center rounded-full">
                  {club.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{club.nombre}</h3>
                  <p className="text-sm text-gray-600">{club.provincia}</p>
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