import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; 

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const RENDER_API_URL = "https://jdxsk-collab.onrender.com"; 
// const RENDER_API_URL = "http://localhost:5000"; // Local Dev URL 

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // login function remains the same
  const login = useCallback((userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
    // We remove navigate('/') from here
  }, []); // navigate removed from dependency array here too

  // logout function remains the same
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    navigate('/login');
  }, [navigate]); 

  // updateUser function remains the same
  const updateUser = useCallback((updatedInfo) => {
    setUser((prevUser) => {
      const newUser = { ...prevUser, ...updatedInfo };
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    });
  }, []); 

  // --- CRITICAL useEffect FIX ---
  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates after unmount

    const processLogin = async () => {
      setLoading(true); // Ensure loading is true initially

      // Check if we have redirect data in the URL
      const urlParams = new URLSearchParams(window.location.search);
      const redirectToken = urlParams.get('token');
      // We ignore 'user' param now to prevent 414 errors and ensure data freshness

      let activeToken = redirectToken || localStorage.getItem('token');

      if (activeToken) {
        // 1. Set token immediately so API requests work
        api.defaults.headers.common['Authorization'] = `Bearer ${activeToken}`;
        
        try {
          // 2. Fetch the FULL user profile (including profilePic) from the server
          const { data: fullUser } = await api.get('/users/me');
          
          if (isMounted) {
            // 3. Update State and Storage
            // Note: login() sets state, localStorage, and headers again (redundant but safe)
            login(fullUser, activeToken); 
            
            // 4. Handle URL cleanup if it was a redirect
            if (redirectToken) {
               window.history.replaceState(null, '', window.location.pathname);
               navigate('/'); 
            }
          }
        } catch (error) {
          console.error("Auth Error (Profile Fetch):", error);
          if (isMounted) logout(); 
        } finally {
           if (isMounted) setLoading(false);
        }
      } else {
        // No token found
        if (isMounted) setLoading(false);
      }
    };

    processLogin();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  // Ensure dependencies are correct and stable
  }, [login, logout, navigate]); 
  // --- END useEffect FIX ---


  const handleGoogleLogin = () => {
    window.location.href = `${RENDER_API_URL}/api/auth/google`;
  };

  const value = {
    user,
    token,
    loading,
    login, // Expose the raw login function if needed elsewhere
    handleGoogleLogin, 
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  // Only render children when loading is complete AND (user exists OR no token exists)
  // This prevents rendering intermediate states during auth check
  const shouldRenderChildren = !loading && (!!user || !token);

  return (
    <AuthContext.Provider value={value}>
      {shouldRenderChildren ? children : null /* Or show a loading spinner */}
    </AuthContext.Provider>
  );
};

