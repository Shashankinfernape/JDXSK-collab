import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; 

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const login = useCallback((userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
    navigate('/');
  }, [navigate]); 

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    navigate('/login');
  }, [navigate]); 

  const updateUser = useCallback((updatedInfo) => {
    setUser((prevUser) => {
      const newUser = { ...prevUser, ...updatedInfo };
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    });
  }, []); 

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
  }, [login, logout]);


  // --- THIS IS THE FIX ---
  // This function now reads the URL from your environment variable
  // instead of being hard-coded to localhost.
  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/google`;
  };
  // --- END FIX ---

  const value = {
    user,
    token,
    loading,
    login,
    handleGoogleLogin, // This is the fixed function
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

