import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error parsing user:', e);
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

 const login = (token, userData) => {
  console.log('API userData:', userData); // DEBUG
  
  const userFinal = {
    ...userData,
    role: Number(userData.rol ?? 0)  // ← role NO rol, maneja null
  };
  
  console.log('userFinal:', userFinal); // DEBUG
  
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(userFinal));
  setToken(token);
  setUser(userFinal);
};

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    isAuthenticated: !!user && !!token
  };

  // ✅ CORREGIDO: value prop correctamente
  return React.createElement(AuthContext.Provider, { 
    value: value 
  }, children);
};

export default AuthProvider;
