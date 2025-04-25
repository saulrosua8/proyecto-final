import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:3000/api/validate-token', {
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
        });
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
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}