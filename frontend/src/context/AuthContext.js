import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const defaultDevBackendUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:8001' : '';
const backendUrl = (process.env.REACT_APP_BACKEND_URL || defaultDevBackendUrl).replace(/\/$/, '');

const api = axios.create({
  baseURL: backendUrl ? `${backendUrl}/api` : '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [primeiroAcesso, setPrimeiroAcesso] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then((response) => {
          setUser(response.data);
          setPrimeiroAcesso(response.data.primeiro_acesso || false);
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, senha) => {
    const response = await api.post('/auth/login', { email, senha });
    localStorage.setItem('token', response.data.access_token);
    setUser(response.data.user);
    setPrimeiroAcesso(response.data.user?.primeiro_acesso || false);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setPrimeiroAcesso(false);
  };

  const changePassword = async (currentPassword, newPassword) => {
    const params = new URLSearchParams();
    params.append('current_password', currentPassword);
    params.append('new_password', newPassword);
    await api.post(`/auth/change-password?${params.toString()}`);
    setPrimeiroAcesso(false);
    // Atualizar usuário
    const response = await api.get('/auth/me');
    setUser(response.data);
  };

  const isAdmin = user?.perfil === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, logout, changePassword, isAdmin, loading, api, primeiroAcesso, setPrimeiroAcesso }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
