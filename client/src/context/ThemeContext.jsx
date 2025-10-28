import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { themes } from '../theme/GlobalStyles';
// --- FIX: Removed unused 'css' import ---
// import { css } from 'styled-components';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

const themeNames = ['netflix', 'spotify', 'apple', 'google', 'instagram'];

export const AppThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState(() => {
    const savedTheme = localStorage.getItem('chatflix-theme');
    return themeNames.includes(savedTheme) ? savedTheme : 'netflix';
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

  const theme = useMemo(() => themes[themeName] || themes['netflix'], [themeName]);

  const value = {
    themeName,
    theme,
    cycleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

