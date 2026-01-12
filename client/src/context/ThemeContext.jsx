import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { ThemeProvider } from 'styled-components'; // Import ThemeProvider
import { themes } from '../theme/GlobalStyles';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

const themeNames = [
  'netflix-dark', 'netflix-light',
  'spotify-dark', 'spotify-light',
  'apple-dark', 'apple-light',
  'google-dark', 'google-light',
  'instagram-dark', 'instagram-light'
];

export const AppThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState(() => {
    const savedTheme = localStorage.getItem('chatflix-theme');
    return themes[savedTheme] ? savedTheme : 'netflix-dark';
  });

  useEffect(() => {
    localStorage.setItem('chatflix-theme', themeName);
  }, [themeName]);

  const cycleTheme = () => {
    setThemeName(prev => {
      const currentIndex = themeNames.indexOf(prev);
      const nextIndex = (currentIndex + 1) % themeNames.length;
      return themeNames[nextIndex];
    });
  };
  
  // Expose direct setter
  const setTheme = (name) => {
      if (themes[name]) setThemeName(name);
  };

  const theme = useMemo(() => themes[themeName] || themes['netflix-dark'], [themeName]);

  const value = {
    themeName,
    theme,
    cycleTheme,
    setTheme, // Exposed
  };

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

