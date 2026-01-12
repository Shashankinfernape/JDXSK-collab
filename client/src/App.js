import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from 'styled-components'; // From styled-components
import { GlobalStyles } from './theme/GlobalStyles'; 
import { useTheme } from './context/ThemeContext'; // From our custom hook

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const { user } = useAuth();
  
  // ThemeProvider is now handled globally in index.js via AppThemeProvider
  
  return (
    <>
      <GlobalStyles /> 
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            user ? <Navigate to="/" replace /> : <Login />
          }
        />
      </Routes>
    </>
  );
}

export default App;
