import { createGlobalStyle } from 'styled-components';

// 1. Define both themes
export const netflixTheme = {
  colors: {
    primary: '#E50914', // Netflix Red
    black: '#000000',
    black_light: '#141414', // Netflix Dark Background
    black_lighter: '#1F1F1F', // For panels and cards
    black_lightest: '#2A2A2A', // For hover states
    grey: '#808080',
    grey_light: '#B3B3B3',
    white: '#FFFFFF',
    text: '#E5E5E5', // Main light grey text
    // Read receipt ticks
    tick_sent: '#B3B3B3', // Grey
    tick_delivered: '#B3B3B3', // Grey
    tick_read: '#55C5E9', // WhatsApp-style blue (easier to see)
  },
  panel_width: '35%',
  max_panel_width: '450px',
  font: "'Roboto', sans-serif"
};

export const spotifyTheme = {
  colors: {
    primary: '#1DB954', // Spotify Green
    black: '#000000',
    black_light: '#121212', // Spotify Dark Background
    black_lighter: '#181818', // For panels and cards
    black_lightest: '#282828', // For hover states
    grey: '#808080',
    grey_light: '#B3B3B3',
    white: '#FFFFFF',
    text: '#E5E5E5',
    // Read receipt ticks
    tick_sent: '#B3B3B3',
    tick_delivered: '#B3B3B3',
    tick_read: '#1DB954', // Spotify Green
  },
  panel_width: '35%',
  max_panel_width: '450px',
  font: "'Roboto', sans-serif"
};

// 2. GlobalStyles will now use the theme passed to it
export const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    background: ${({ theme }) => theme.colors.black_light};
    color: ${({ theme }) => theme.colors.text};
    font-family: ${({ theme }) => theme.font};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow: hidden; 
  }

  /* Custom Scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.black_lighter};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.grey};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.primary};
  }
`;