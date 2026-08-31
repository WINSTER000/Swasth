import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import i18n from '../i18n/i18n';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('swasth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('swasth_token') || null);
  const [loading, setLoading] = useState(true);

  // Set default axios header
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get('/api/auth/me');
        setUser(res.data.user);
        localStorage.setItem('swasth_user', JSON.stringify(res.data.user));
        if (res.data.user.languagePreference) {
          i18n.changeLanguage(res.data.user.languagePreference);
        }
      } catch (err) {
        console.error('Failed to authenticate token:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    const { token: newToken, user: userData } = res.data;
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('swasth_token', newToken);
    localStorage.setItem('swasth_user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

    if (userData.languagePreference) {
      i18n.changeLanguage(userData.languagePreference);
    }
    return userData;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('swasth_token');
    localStorage.removeItem('swasth_user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateUserLanguage = async (newLang) => {
    i18n.changeLanguage(newLang);
    if (user) {
      const updated = { ...user, languagePreference: newLang };
      setUser(updated);
      localStorage.setItem('swasth_user', JSON.stringify(updated));
      try {
        await axios.patch('/api/auth/profile', { languagePreference: newLang });
      } catch (e) {
        console.warn('Failed to sync language preference with backend:', e);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUserLanguage }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
