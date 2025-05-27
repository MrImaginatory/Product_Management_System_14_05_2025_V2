import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {jwtDecode} from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const getToken = () => {
  if (localStorage.getItem('token')) {
    return localStorage.getItem('token');
  } else {
    return sessionStorage.getItem('token');
  }
};

const getDecodedToken = (token) => {
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};

const isTokenExpired = (decodedToken) => {
  if (!decodedToken || !decodedToken.exp) return true;
  return decodedToken.exp * 1000 < Date.now();
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = getToken();
    const decoded = getDecodedToken(token);
    if (decoded && !isTokenExpired(decoded)) {
      return decoded;
    }
    return null;
  });

  const logout = useCallback((expired = false) => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    sessionStorage.removeItem('token');
    if (expired) {
      alert('Session expired. Please log in again.');
    }
  }, []);

  // Setup token expiration timer
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const decoded = getDecodedToken(token);
    if (!decoded || isTokenExpired(decoded)) {
      // Defer logout to avoid React setState in render warning
      setTimeout(() => logout(true), 0);
      return;
    }

    const timeout = decoded.exp * 1000 - Date.now();
    const timerId = setTimeout(() => logout(true), timeout);

    return () => clearTimeout(timerId);
  }, [user, logout]);

  const login = (userData, token) => {
    if (token) {
      localStorage.setItem('token', token);
      sessionStorage.setItem('token', token);
    }
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;