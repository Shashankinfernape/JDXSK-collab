import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; 

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const RENDER_API_URL = "https://jdxsk-collab.onrender.com"; 

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
      const redirectUser = urlParams.get('user');

      if (redirectToken && redirectUser) {
        try {
          const userData = JSON.parse(decodeURIComponent(redirectUser));
          // Call login to set state and local storage
          login(userData, redirectToken); 
          // Clean the URL *after* processing
          window.history.replaceState(null, '', window.location.pathname);
          // Now navigate AFTER state is likely set
          if (isMounted) navigate('/'); 
        } catch (e) {
          console.error("Failed to parse user data from URL", e);
          if (isMounted) logout(); // Log out if parsing failed
        } finally {
           if (isMounted) setLoading(false);
        }
      } else {
        // No redirect, check for stored token
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          try {
            const { data: userData } = await api.get('/users/me'); 
            if (isMounted) {
              // Call login but don't navigate (already on correct page or loading home)
              setUser(userData); // Directly set user after verification
              localStorage.setItem('user', JSON.stringify(userData));
            }
          } catch (error) {
            console.error("Auth Error (Token Check):", error);
            if (isMounted) logout(); 
          } finally {
            if (isMounted) setLoading(false);
          }
        } else {
          // No token found anywhere
          if (isMounted) setLoading(false);
        }
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

