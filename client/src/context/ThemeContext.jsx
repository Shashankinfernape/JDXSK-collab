import React, { createContext, useContext, useState, useMemo } from 'react';
import { netflixTheme, spotifyTheme } from '../theme/GlobalStyles';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const AppThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState('netflix'); // 'netflix' or 'spotify'

  const toggleTheme = () => {
    setThemeName(prev => (prev === 'netflix' ? 'spotify' : 'netflix'));
  };

  // Select the correct theme object based on the name
  const theme = useMemo(
    () => (themeName === 'netflix' ? netflixTheme : spotifyTheme),
    [themeName]
  );

  const value = {
    themeName,
    theme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};