import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { themes } from '../theme/GlobalStyles'; // Import the themes object

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

const themeNames = ['netflix', 'spotify', 'apple', 'google']; // Order of themes

export const AppThemeProvider = ({ children }) => {
  // Read saved theme from localStorage or default to 'netflix'
  const [themeName, setThemeName] = useState(() => {
    return localStorage.getItem('chatflix-theme') || 'netflix';
  });

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('chatflix-theme', themeName);
  }, [themeName]);

  const cycleTheme = () => {
    setThemeName(prev => {
      const currentIndex = themeNames.indexOf(prev);
      const nextIndex = (currentIndex + 1) % themeNames.length; // Loop back to 0
      return themeNames[nextIndex];
    });
  };

  // Select the correct theme object based on the name
  const theme = useMemo(() => themes[themeName], [themeName]);

  const value = {
    themeName,
    theme,
    cycleTheme, // Renamed from toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};