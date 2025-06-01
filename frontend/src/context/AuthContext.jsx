import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_API_URL;
    if (token) {
      fetch(`${apiUrl}/api/validate-token`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Token inválido');
          }
          return response.json();
        })
        .then((data) => setUser(data.user)) // Restaurar sesión si el token es válido
        .catch(() => {
          localStorage.removeItem('token'); // Eliminar token inválido
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token); // Guardar token en localStorage
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token'); // Eliminar token de localStorage
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}