import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Decode role from JWT payload (no verify — just read claims)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Pre-set role from token so UI renders correctly before /me resolves
        if (payload?.role) {
          setAdmin((prev) => prev ? prev : { role: payload.role });
        }
      } catch { /* ignore decode errors */ }

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

  const isAdmin   = admin?.role === 'admin' || admin?.role === 'Administrator';
  const isAirline = admin?.role === 'airline';

  return (
    <AuthContext.Provider value={{ admin, loading, loginAdmin, updateAdmin, logout, isAdmin, isAirline }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
