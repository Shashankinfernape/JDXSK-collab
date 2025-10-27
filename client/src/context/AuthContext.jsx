import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // Used to verify token

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Function to save user data and token
  const login = useCallback((userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
    // Set token for future API calls
    api.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
    navigate('/'); // Redirect to home page
  }, [navigate]);

  // Function to clear user data and token
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    navigate('/login'); // Redirect to login page
  }, [navigate]);

  // Function to update local user state (e.g., after profile edit)
  const updateUser = useCallback((updatedInfo) => {
    setUser((prevUser) => {
      const newUser = { ...prevUser, ...updatedInfo };
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    });
  }, []);

  // Effect runs on app load to check for existing token or callback redirect
  useEffect(() => {
    // Function to verify a stored token
    const checkToken = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`; // Set early
        try {
          // Ask the server to validate the token and get user data
          const { data: userData } = await api.get('/users/me');
          setUser(userData); // Set user if token is valid
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
          console.error("Auth Error (Token Check):", error);
          logout(); // Clear invalid token/user data
        }
      }
      setLoading(false); // Finished checking
    };

    // Check if the current URL contains token/user from the server redirect
    const urlParams = new URLSearchParams(window.location.search);
    const redirectToken = urlParams.get('token');
    const redirectUser = urlParams.get('user');

    if (redirectToken && redirectUser) {
      // We got data from the server's callback!
      try {
        const userData = JSON.parse(decodeURIComponent(redirectUser));
        login(userData, redirectToken); // Save the data
        // Clean the token/user from the URL bar
        window.history.replaceState(null, '', window.location.pathname);
      } catch (e) {
        console.error("Failed to parse user data from URL", e);
        setLoading(false); // Stop loading even if parse failed
      }
      // Note: setLoading(false) happens inside login() via navigate() triggering re-render
    } else {
      // No redirect data, just check for a stored token
      checkToken();
    }
  }, [login, logout]); // Dependencies for useEffect

  // Function called when the "Sign in" button is clicked
  const handleGoogleLogin = () => {
    // Redirect the browser to the server's Google auth initiation route
    // This MUST use the API URL from the environment variable
    const apiUrl = process.env.REACT_APP_API_URL;
    if (!apiUrl) {
      console.error("CRITICAL ERROR: REACT_APP_API_URL is not defined!");
      // Optionally show an error to the user here
      return; // Stop if the URL is missing
    }
    window.location.href = `${apiUrl}/api/auth/google`;
  };

  // Value provided by the context
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

  // Render children only after loading is complete
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

