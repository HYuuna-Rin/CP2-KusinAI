/*
  File: src/context/AuthContext.jsx
  Purpose: Centralized authentication state and helpers for the frontend.
  Responsibilities:
  - Provide login/logout, token persistence, and user info to components.
  - Expose a React Context for easy consumption across the app.
  Notes: Keep in sync with server auth contracts.
*/
import React, { createContext, useContext, useState, useEffect } from 'react';
// lightweight JWT decode (only decodes payload, does not verify signature)
const jwtDecode = (token) => {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    let payload = parts[1];
    // Add padding if missing
    payload = payload.replace(/-/g, '+').replace(/_/g, '/');
    while (payload.length % 4) payload += '=';
    // atob works in browsers
    const decoded = atob(payload);
    // percent-decode utf8
    const json = decodeURIComponent(
      decoded
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(json);
  } catch (e) {
    console.warn('jwtDecode fallback failed', e);
    return null;
  }
};

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const getStoredToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token') || null;
  };

  const [token, setToken] = useState(getStoredToken);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      try {
        const payload = jwtDecode(token);
        setUser(payload);
      } catch (e) {
        console.warn('Failed to decode JWT', e);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [token]);

  const login = (newToken, remember = false) => {
    if (!newToken) return;
    setToken(newToken);
    try {
      const payload = jwtDecode(newToken);
      setUser(payload);
    } catch (e) {
      setUser(null);
    }
    if (remember) {
      localStorage.setItem('token', newToken);
      sessionStorage.removeItem('token');
    } else {
      sessionStorage.setItem('token', newToken);
      localStorage.removeItem('token');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
  };

  const value = {
    token,
    user,
    login,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
