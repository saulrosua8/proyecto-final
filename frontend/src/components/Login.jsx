import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [contraseña, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Nuevo estado para loading
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Mostrar estado de carga
    setError(''); // Limpiar errores previos
    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, contraseña }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      localStorage.setItem('token', data.token); // Guardar token en localStorage
      login(data.user, data.token); // Pasar token al contexto
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false); // Finalizar estado de carga
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:3000/api/validate-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Token inválido');
          }
          return response.json();
        })
        .then((data) => {
          if (data.user) {
            login(data.user, token); // Restaurar sesión
            navigate('/dashboard');
          } else {
            throw new Error('Usuario no encontrado');
          }
        })
        .catch(error => {
          console.log(error.message);
          localStorage.removeItem('token'); // Eliminar token inválido
        });
    }
  }, [login, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-teal-500 to-blue-600">
      <div className="bg-white p-10 rounded-xl shadow-xl w-full max-w-lg">
        <img src="/src/assets/logo.png" alt="Logo" className="mx-auto mb-4 w-32 h-32" />
        <h2 className="text-4xl font-bold mb-8 text-center text-gray-800">Iniciar Sesión</h2>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
              required
              disabled={loading}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="password">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={contraseña}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
              required
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-teal-600 text-white py-4 rounded-lg font-semibold hover:bg-teal-700 transition disabled:bg-teal-300"
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </button>
        </form>
        <p className="mt-8 text-center text-gray-700">
          ¿No tienes una cuenta?{' '}
          <Link to="/register" className="text-teal-500 font-medium hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;