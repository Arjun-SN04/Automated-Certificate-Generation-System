import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getMe()
        .then((res) => setAdmin(res.data))
        .catch(() => {
          localStorage.removeItem('token');
          setAdmin(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const loginAdmin = (token, adminData) => {
    localStorage.setItem('token', token);
    setAdmin(adminData);
  };

  const updateAdmin = (token, adminData) => {
    if (token) localStorage.setItem('token', token);
    setAdmin(adminData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, loginAdmin, updateAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
