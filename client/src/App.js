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
  // --- This is the key change ---
  // Last Updated: UI Layout & Reply Fixes
  // We get the active theme object from our custom hook
  const { theme } = useTheme(); 

  // We wrap the entire app in the styled-components ThemeProvider
  // This makes the theme available to all styled components
  return (
    <ThemeProvider theme={theme}>
      {/* GlobalStyles MUST be rendered here to use the dynamic theme object */}
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
    </ThemeProvider>
  );
}

export default App;
