import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ethara_token');
    const saved = localStorage.getItem('ethara_user');
    if (token && saved) {
      setUser(JSON.parse(saved));
      api.get('/auth/me')
        .then((res) => { setUser(res.data.user); localStorage.setItem('ethara_user', JSON.stringify(res.data.user)); })
        .catch(() => { localStorage.removeItem('ethara_token'); localStorage.removeItem('ethara_user'); setUser(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('ethara_token', res.data.token);
    localStorage.setItem('ethara_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const register = async (name, email, password, role) => {
    const res = await api.post('/auth/register', { name, email, password, role });
    localStorage.setItem('ethara_token', res.data.token);
    localStorage.setItem('ethara_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('ethara_token');
    localStorage.removeItem('ethara_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
