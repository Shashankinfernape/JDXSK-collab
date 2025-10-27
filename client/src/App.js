import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from 'styled-components'; // Import from styled-components
import { GlobalStyles } from './theme/GlobalStyles'; // Import GlobalStyles
import { useTheme } from './context/ThemeContext'; // Import our new theme hook

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const { user } = useAuth();
  const { theme } = useTheme(); // Get the active theme object

  return (
    // Pass the active theme to ThemeProvider
    <ThemeProvider theme={theme}>
      <GlobalStyles /> {/* This injects all the global styles */}
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