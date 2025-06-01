import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';
import toast from 'react-hot-toast';

function Login() {
  const [email, setEmail] = useState('');
  const [contraseña, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const promesaLogin = fetch('/api/login', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, contraseña }),
    }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }
      localStorage.setItem('token', data.token);
      login(data.user, data.token);
      navigate('/dashboard');
      return data;
    }).finally(() => {
      setLoading(false);
    });

    toast.promise(promesaLogin, {
      loading: 'Iniciando sesión...',
      success: '¡Bienvenido!',
      error: (err) => err.message || 'Error al iniciar sesión',
    });
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/validate-token', {
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
    
          localStorage.removeItem('token'); // Eliminar token inválido
        });
    }
  }, [login, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-500 via-blue-500 to-purple-600">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-lg transform transition-all duration-300 hover:shadow-3xl">
        <div className="flex flex-col items-center">
          <img src="/logo_blanco.png" alt="Logo" className="w-32 h-32 mb-6 transform transition-transform hover:scale-105" />
          <h2 className="text-4xl font-extrabold mb-8 text-center bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">Iniciar Sesión</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <input
                type="text"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-200"
                required
                disabled={loading}
                placeholder="tu@email.com"
              />
              <svg className="w-6 h-6 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2" htmlFor="password">
              Contraseña
            </label>
            <div className="relative">
              <input
                type="password"
                id="password"
                value={contraseña}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-200"
                required
                disabled={loading}
                placeholder="••••••••"
              />
              <svg className="w-6 h-6 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <Spinner size="small" />
                <span className="ml-2">Cargando...</span>
              </div>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>
        <p className="mt-8 text-center text-gray-600">
          ¿No tienes una cuenta?{' '}
          <Link to="/register" className="text-teal-600 font-semibold hover:text-teal-700 transition-colors">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;