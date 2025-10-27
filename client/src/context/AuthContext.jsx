import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; 

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// --- HARDCODE FIX ---
const RENDER_API_URL = "https://jdxsk-collab.onrender.com"; 
// --- END HARDCODE FIX ---


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // FIX: This function MUST be defined outside of the useCallback block that uses it,
  // but it is simple enough that we will keep it as useCallback for stability.
  const login = useCallback((userData, userToken) => {
    // 1. Update State
    setUser(userData);
    setToken(userToken);
    
    // 2. Update Storage
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
    
    // 3. Update Axios/API Header
    api.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
    
    // 4. Navigate (Triggers final render)
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
    // This function must not rely on anything changing outside of it
    const checkToken = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        try {
          const { data: userData } = await api.get('/users/me'); 
          // FIX: We no longer call setUser directly here, we use login() 
          // to centralize the state setting and ensure stability.
          login(userData, storedToken); 
        } catch (error) {
          console.error("Auth Error (Token Check):", error);
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
        // FIX: Ensure the cleanup happens after successful login
        window.history.replaceState(null, '', window.location.pathname);
      } catch (e) {
        console.error("Failed to parse user data from URL", e);
        setLoading(false); 
      }
    } else {
      checkToken();
    }
  }, [login, logout]); // Dependencies are now correct

  // The rest of the component (handleGoogleLogin, value, and return) is unchanged.
  const handleGoogleLogin = () => {
    window.location.href = `${RENDER_API_URL}/api/auth/google`;
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
