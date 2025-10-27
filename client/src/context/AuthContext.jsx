// --- THIS IS THE FIX ---
// We import 'useCallback'
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// --- END FIX ---
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; 

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // --- THIS IS THE FIX ---
  // We wrap 'login', 'logout', and 'updateUser' in useCallback.
  // This ensures they don't change on every render.
  const login = useCallback((userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
    navigate('/');
  }, [navigate]); // 'navigate' is a dependency

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    navigate('/login');
  }, [navigate]); // 'navigate' is a dependency

  const updateUser = useCallback((updatedInfo) => {
    setUser((prevUser) => {
      const newUser = { ...prevUser, ...updatedInfo };
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    });
  }, []); // No dependencies
  // --- END FIX ---

  useEffect(() => {
    const checkToken = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const { data: userData } = await api.get('/users/me');
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
          console.error("Auth Error:", error);
          logout();
        }
      }
      setLoading(false);
    };

    const urlParams = new URLSearchParams(window.location.search);
    const redirectToken = urlParams.get('token');
    const redirectUser = urlParams.get('user');

    if (redirectToken && redirectUser) {
      try {
        const userData = JSON.parse(decodeURIComponent(redirectUser));
        login(userData, redirectToken);
        window.history.replaceState(null, '', '/');
      } catch (e) {
        console.error("Failed to parse user data from URL");
        setLoading(false);
      }
    } else {
      checkToken();
    }
  // --- THIS IS THE FIX ---
  // We add 'login' and 'logout' to the dependency array.
  // It's now safe because we wrapped them in useCallback.
  }, [login, logout]);
  // --- END FIX ---


  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  const value = {
    user,
    token,
    loading,
    login,
    handleGoogleLogin,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};