import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      const { accessToken, id, fullName, email, roles } = response.data;

      localStorage.setItem('token', accessToken);
      
      const userProfile = { id, username, fullName, email, roles };
      localStorage.setItem('user', JSON.stringify(userProfile));

      setToken(accessToken);
      setUser(userProfile);
      return userProfile;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed. Please check credentials.';
    }
  };

  const register = async (username, email, password, fullName, role) => {
    try {
      await api.post('/auth/auth-register', { username, email, password, fullName, role }); // wait, our endpoint is /api/auth/register
    } catch (error) {
      // Let's verify the endpoint name: AuthController has @PostMapping("/register") under @RequestMapping("/api/auth"). So it is /api/auth/register! Let's write '/auth/register'.
      throw error.response?.data || 'Registration failed.';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const hasRole = (roleName) => {
    if (!user || !user.roles) return false;
    return user.roles.includes(roleName) || user.roles.includes(`ROLE_${roleName}`);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register: async (u, e, p, f, r) => {
      try {
        await api.post('/auth/register', { username: u, email: e, password: p, fullName: f, role: r });
      } catch (error) {
        throw error.response?.data || 'Registration failed.';
      }
    }, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};
